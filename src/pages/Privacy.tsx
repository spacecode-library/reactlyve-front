import React from 'react';
import MainLayout from '../layouts/MainLayout'; // Added import

const PrivacyPolicyPage: React.FC = () => {
  return (
    <MainLayout> {/* Added MainLayout wrapper */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-2">
          This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-3">1. Information Collection and Use</h2>
      <p className="mb-2">
        We collect several different types of information for various purposes to provide and improve our Service to you. Types of Data Collected include Personal Data (e.g. email address, name, usage data).
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-3">2. Use of Data</h2>
      <p className="mb-2">
        Our platform uses the collected data for various purposes: to provide and maintain the Service; to notify you about changes to our Service; to allow you to participate in interactive features of our Service when you choose to do so; to provide customer care and support; to provide analysis or valuable information so that we can improve the Service; to monitor the usage of the Service; to detect, prevent and address technical issues.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-3">3. Data Security</h2>
      <p className="mb-2">
        The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
      </p>
      <p className="mt-6">
        <em>This is a placeholder document. The actual Privacy Policy will be updated by the legal team.</em>
      </p>
      </div>
    </MainLayout> 
  );
};

export default PrivacyPolicyPage;
