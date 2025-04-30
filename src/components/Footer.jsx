import { Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
        
        <div className="space-x-4 mb-4 text-sm">
            <a href="#" className="hover:text-textDark">About Us</a>
            <a href="#" className="hover:text-textDark">Contact Us</a>
            <a href="#" className="hover:text-textDark">Terms of Service</a>
            <a href="#" className="hover:text-textDark">Privacy Policy</a>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} RentEasily. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
