import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
      <p className="mb-2">
        Welcome to our platform. If you continue to browse and use this platform, you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern our relationship with you in relation to this platform.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
      <p className="mb-2">
        By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-3">2. Changes to Terms</h2>
      <p className="mb-2">
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
      </p>
      <p className="mt-6">
        <em>This is a placeholder document. The actual Terms and Conditions will be updated by the legal team.</em>
      </p>
    </div>
  );
};

export default TermsPage;
