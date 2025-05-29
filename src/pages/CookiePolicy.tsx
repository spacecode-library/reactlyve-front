import React from 'react';
import MainLayout from '../layouts/MainLayout';

const CookiePolicyPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">COOKIE POLICY</h1>
        <p className="text-sm text-gray-600 mb-6">Last updated May 28, 2025</p>
        <p className="mb-2">
          This Cookie Policy explains how Reactlyve ("<strong>Company</strong>," "<strong>we</strong>," "<strong>us</strong>," and "<strong>our</strong>") uses cookies and similar technologies to recognize you when you visit our website at <a href="https://reactlyve.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://reactlyve.com</a> ("<strong>Website</strong>"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
        </p>
        <p className="mb-2">
          In some cases, we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">What are cookies?</h2>
        <p className="mb-2">
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
        </p>
        <p className="mb-2">
          Cookies set by the website owner (in this case, Reactlyve) are called "first-party cookies." We only use a first-party cookie for essential site functionality.
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Third-Party Cookies</h3>
        <p className="mb-2">We do not use any third-party cookies on our platform.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Why do we use cookies?</h2>
        <p className="mb-2">We only use a single, essential first-party cookie called “theme” to store your interface display preferences. This helps ensure a consistent experience as you navigate our platform.</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Tracking & Analytics</h3>
        <p className="mb-2">We do not use any cookies or similar technologies for advertising, analytics, profiling, or behavioural tracking.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">How can I control cookies?</h2>
        <p className="mb-2">
          You have the right to decide whether to accept or reject cookies. 
        </p>
        <p className="mb-2">Because we only use an essential cookie, consent is not required under the UK Privacy and Electronic Communications Regulations (PECR) or EU cookie laws. You will not be asked to accept or reject this cookie.</p>
        <p className="mb-2">
          You may also set or amend your web browser controls to accept or refuse cookies.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">How can I control cookies on my browser?</h3>
        <p className="mb-2">You may manage or delete the theme cookie through your browser settings. If you disable this cookie, your display preferences (e.g. dark/light mode) may reset on each visit.</p>
        <p className="mb-2">
          As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information. The following is information about how to manage cookies on the most popular browsers:
        </p>
        <p className="mb-1"><a href="https://support.google.com/chrome/answer/95647?hl=en" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Chrome</a></p>
        <p className="mb-1"><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Internet Explorer</a></p>
        <p className="mb-1"><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Firefox</a></p>
        <p className="mb-1"><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></p>
        <p className="mb-1"><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Edge</a></p>
        <p className="mb-1"><a href="https://help.opera.com/en/latest/web-preferences/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Opera</a></p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">How often will you update this Cookie Policy?</h2>
        <p className="mb-2">We may update this Cookie Policy periodically to reflect changes in our cookie practices or legal obligations. Please check this page from time to time for updates.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Where can I get further information?</h2>
        <p className="mb-2">
          If you have any questions about our use of cookies or other technologies, please email us at <a href="mailto:support@reactlyve.com" className="text-blue-600 hover:underline">support@reactlyve.com</a>.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">COOKIE POLICY – Plain English FAQs</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">Q1: What cookies do you use?</h3>
        <p className="mb-2">Just one. A theme preference cookie so your display settings are remembered.</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Q2: Do you use cookies for tracking or ads?</h3>
        <p className="mb-2">No. We don’t use analytics, advertising, or third-party cookies.</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Q3: Can I turn off the cookie?</h3>
        <p className="mb-2">Yes, through your browser settings. But it may reset your display preferences.</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Q4: What about those cookie banners?</h3>
        <p className="mb-2">Since we only use an essential cookie, we don’t require banner-based consent under UK & EU cookie laws.</p>
      </div>
    </MainLayout>
  );
};

export default CookiePolicyPage;
