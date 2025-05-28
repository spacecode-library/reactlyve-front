import React from 'react';
import MainLayout from '../layouts/MainLayout'; // Added import

const CookiePolicyPage: React.FC = () => {
  return (
    <MainLayout> {/* Added MainLayout wrapper */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
        <p className="mb-2">
          This Cookie Policy explains what cookies are and how we use them on our platform. You should read this policy so you can understand what type of cookies we use, the information we collect using cookies and how that information is used.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-3">What Are Cookies?</h2>
      <p className="mb-2">
        Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-3">How Do We Use Cookies?</h2>
      <p className="mb-2">
        We use cookies to understand how you use our platform, to remember your preferences, and to personalize your experience. For example, cookies can help us remember your login details so you don't have to enter them every time you visit.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-3">Your Choices Regarding Cookies</h2>
      <p className="mb-2">
        If you'd prefer to avoid the use of cookies on the platform, you can disable the use of cookies in your browser and then delete the cookies saved in your browser associated with this website. You may use this option for preventing the use of cookies at any time.
      </p>
      <p className="mt-6">
        <em>This is a placeholder document. The actual Cookie Policy will be updated to reflect specific platform functionalities.</em>
      </p>
      </div>
    </MainLayout> 
  );
};

export default CookiePolicyPage;
