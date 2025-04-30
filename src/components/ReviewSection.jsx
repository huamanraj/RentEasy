import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { databases } from '../utils/appwriteConfig';
import { ID, Query } from 'appwrite';
import toast from 'react-hot-toast';

const ReviewSection = ({ flatId }) => {
  const { user } = useAuth(); // Get user status
  const [newReview, setNewReview] = useState({ rating: 5, reviewText: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const REVIEWS_PER_PAGE = 5;

  const fetchReviews = async (currentPage = 1) => {
    try {
      const offset = (currentPage - 1) * REVIEWS_PER_PAGE;
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_REVIEWS_COLLECTION_ID,
        [
          Query.equal('flatId', flatId),
          Query.orderDesc('$createdAt'),
          Query.limit(REVIEWS_PER_PAGE),
          Query.offset(offset)
        ]
      );
      setReviews(response.documents);
      setTotalReviews(response.total);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
    if (user) {
      checkUserReview();
    }
  }, [page, flatId, user]);

  const checkUserReview = async () => {
    try {
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_REVIEWS_COLLECTION_ID,
        [
          Query.equal('flatId', flatId),
          Query.equal('userId', user.$id)
        ]
      );
      setHasUserReviewed(response.documents.length > 0);
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const handleRatingChange = (value) => {
    setNewReview({ ...newReview, rating: value });
  };

  const handleReviewTextChange = (e) => {
    setNewReview({ ...newReview, reviewText: e.target.value });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (hasUserReviewed) {
      toast.error('You have already reviewed this flat');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create review document with only the schema-defined attributes
      const reviewData = {
        flatId: flatId,
        userId: user.$id,
        rating: newReview.rating,
        reviewText: newReview.reviewText,
        userName: user.name || 'Anonymous'
      };

      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_REVIEWS_COLLECTION_ID,
        ID.unique(),
        reviewData
      );
      
      toast.success('Review submitted successfully!');
      setNewReview({ rating: 5, reviewText: '' });
      setHasUserReviewed(true);
      fetchReviews(1); // Refresh reviews
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading reviews...</div>;
  }

  // Calculate overall rating
  const overallRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  // Generate array of stars for rating input
  const renderStarInput = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              fill={newReview.rating >= star ? "currentColor" : "none"}
              className={`w-6 h-6 ${newReview.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-textDark border-b pb-4">Reviews & Ratings</h2>
      
      {/* Overall Rating Card */}
      <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-4xl font-bold text-primary">{overallRating}</div>
          <div className="flex flex-col">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  fill={overallRating >= star ? "currentColor" : "none"}
                  className={`w-5 h-5 ${overallRating >= star ? "text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">Based on {reviews.length} reviews</div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {user && !hasUserReviewed && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-textDark mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              {renderStarInput()}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={newReview.reviewText}
                onChange={handleReviewTextChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Share your experience with this property..."
                required
                minLength={10}
                maxLength={500}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !newReview.reviewText.trim()}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 
                       transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List with Pagination */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          <>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div 
                  key={review.$id} 
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-textDark">{review.userName || "Anonymous"}</div>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            fill={review.rating >= star ? "currentColor" : "none"}
                            className={`w-4 h-4 ${review.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.$createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{review.reviewText}</p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to share your experience!
          </div>
        )}
      </div>
    </div>
  );
};

// Update prop validation
ReviewSection.propTypes = {
  flatId: PropTypes.string.isRequired,
};

export default ReviewSection;
