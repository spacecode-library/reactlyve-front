import React from 'react';
import MainLayout from '../layouts/MainLayout'; // Added import

const TermsPage: React.FC = () => {
  return (
    <MainLayout> {/* Added MainLayout wrapper */}
      <div className="mx-auto max-w-4xl px-4 py-8 text-neutral-700 dark:text-neutral-300">
        <h1 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">TERMS OF SERVICE</h1>
        <p className="text-sm text-gray-600 mb-6 dark:text-gray-400">Last updated June 12, 2025</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">AGREEMENT TO OUR LEGAL TERMS</h2>
        <p className="mb-2">
          We are Reactlyve ('<strong>Company</strong>', '<strong>we</strong>', '<strong>us</strong>', or '<strong>our</strong>'), a company registered in the United Kingdom.
        </p>
        <p className="mb-2">
          We operate the website https://reactlyve.com/ (the '<strong>Site</strong>'), as well as any other related products and services that refer or link to these legal terms (the '<strong>Legal Terms</strong>') (collectively, the '<strong>Services</strong>').
        </p>
        <p className="mb-2">
          Reactlyve is an innovative web-based platform that allows users to send video, image, or text messages and capture real-time reactions from recipients via webcam. Whether for personal messages, content feedback, or fun social interactions, Reactlyve creates a unique experience by merging messaging with authentic human expression. Our goal is to foster genuine connections by enabling users to not only communicate but also see how their messages are received. Users can record, send, and view reactions through a privacy-aware, browser-based interface without the need for additional software. The platform is designed with privacy, user control, and data protection at its core, ensuring a safe and engaging digital communication experience.
        </p>
        <p className="mb-2">
          You can contact us by email at <a href="mailto:support@reactlyve.com" className="text-blue-600 hover:underline">support@reactlyve.com</a>.
        </p>
        <p className="mb-2">
          These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ('<strong>you</strong>'), and Reactlyve, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
        </p>
        <p className="mb-2">
          Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms from time to time. We will alert you about any changes by updating the 'Last updated' date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.
        </p>
        <p className="mb-2">
            The Services are intended for users who are at least 18 years old. If you are aged 13 to 17, you may only use the Services with verifiable parental or legal guardian consent.
        </p>

        <h2 id="table-of-contents-terms" className="text-2xl font-semibold mt-6 mb-3">TABLE OF CONTENTS</h2>
        <p className="mb-1"><a href="#our-services" className="text-blue-600 hover:underline">OUR SERVICES</a></p>
        <p className="mb-1"><a href="#intellectual-property-rights" className="text-blue-600 hover:underline">INTELLECTUAL PROPERTY RIGHTS</a></p>
        <p className="mb-1"><a href="#user-representations" className="text-blue-600 hover:underline">USER REPRESENTATIONS</a></p>
        <p className="mb-1"><a href="#user-registration" className="text-blue-600 hover:underline">USER REGISTRATION</a></p>
        <p className="mb-1"><a href="#prohibited-activities" className="text-blue-600 hover:underline">PROHIBITED ACTIVITIES</a></p>
        <p className="mb-1"><a href="#user-generated-contributions" className="text-blue-600 hover:underline">USER GENERATED CONTRIBUTIONS</a></p>
        <p className="mb-1"><a href="#contribution-licence" className="text-blue-600 hover:underline">CONTRIBUTION LICENCE</a></p>
        <p className="mb-1"><a href="#services-management" className="text-blue-600 hover:underline">SERVICES MANAGEMENT</a></p>
        <p className="mb-1"><a href="#privacy-policy-terms" className="text-blue-600 hover:underline">PRIVACY POLICY</a></p>
        <p className="mb-1"><a href="#copyright-infringements" className="text-blue-600 hover:underline">COPYRIGHT INFRINGEMENTS</a></p>
        <p className="mb-1"><a href="#term-and-termination" className="text-blue-600 hover:underline">TERM AND TERMINATION</a></p>
        <p className="mb-1"><a href="#modifications-and-interruptions" className="text-blue-600 hover:underline">MODIFICATIONS AND INTERRUPTIONS</a></p>
        <p className="mb-1"><a href="#governing-law" className="text-blue-600 hover:underline">GOVERNING LAW</a></p>
        <p className="mb-1"><a href="#dispute-resolution" className="text-blue-600 hover:underline">DISPUTE RESOLUTION</a></p>
        <p className="mb-1"><a href="#corrections" className="text-blue-600 hover:underline">CORRECTIONS</a></p>
        <p className="mb-1"><a href="#disclaimer" className="text-blue-600 hover:underline">DISCLAIMER</a></p>
        <p className="mb-1"><a href="#limitations-of-liability" className="text-blue-600 hover:underline">LIMITATIONS OF LIABILITY</a></p>
        <p className="mb-1"><a href="#indemnification" className="text-blue-600 hover:underline">INDEMNIFICATION</a></p>
        <p className="mb-1"><a href="#user-data-terms" className="text-blue-600 hover:underline">USER DATA</a></p>
        <p className="mb-1"><a href="#electronic-communications" className="text-blue-600 hover:underline">ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</a></p>
        <p className="mb-1"><a href="#california-users-and-residents" className="text-blue-600 hover:underline">CALIFORNIA USERS AND RESIDENTS</a></p>
        <p className="mb-1"><a href="#miscellaneous" className="text-blue-600 hover:underline">MISCELLANEOUS</a></p>
        <p className="mb-1"><a href="#contact-us-terms" className="text-blue-600 hover:underline">CONTACT US</a></p>
        <p className="mb-1"><a href="#terms-faqs" className="text-blue-600 hover:underline">TERMS OF SERVICE – FAQs</a></p>

        <h2 id="our-services" className="text-2xl font-semibold mt-6 mb-3">1. OUR SERVICES</h2>
        <p className="mb-2">
          The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
        </p>
        <p className="mb-2">
          The Services are not tailored to comply with industry-specific regulations (Health Insurance Portability and Accountability Act (HIPAA), Federal Information Security Management Act (FISMA), etc.), so if your interactions would be subjected to such laws, you may not use the Services. You may not use the Services in a way that would violate the Gramm-Leach-Bliley Act (GLBA).
        </p>

        <h2 id="intellectual-property-rights" className="text-2xl font-semibold mt-6 mb-3">2. INTELLECTUAL PROPERTY RIGHTS</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">Our Intellectual Property</h3>
        <p className="mb-2">
          We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the '<strong>Content</strong>'), as well as the trademarks, service marks, and logos contained therein (the '<strong>Marks</strong>').
        </p>
        <p className="mb-2">
          Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties in the United States and around the world.
        </p>
        <p className="mb-2">
          The Content and Marks are provided in or through the Services 'AS IS' for your personal, non-commercial use or internal business purpose only.
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Your Use of Our Services</h3>
        <p className="mb-2">
          Subject to your compliance with these Legal Terms, including the '<strong>PROHIBITED ACTIVITIES</strong>' section below, we grant you a non-exclusive, non-transferable, revocable license to:
        </p>
        <p className="mb-2">access the Services; and</p>
        <p className="mb-2">download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use or internal business purpose.</p>
        <p className="mb-2">
          Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
        </p>

        <h2 id="user-representations" className="text-2xl font-semibold mt-6 mb-3">3. USER REPRESENTATIONS</h2>
        <p className="mb-2">By using the Services, you represent and warrant that:</p>
        <p className="mb-2">All registration information you submit will be true, accurate, current, and complete.</p>
        <p className="mb-2">You will maintain the accuracy of such information and promptly update such registration information as necessary.</p>
        <p className="mb-2">You have the legal capacity and you agree to comply with these Legal Terms.</p>
        <p className="mb-2">You are not a minor in the jurisdiction in which you reside.</p>
        <p className="mb-2">You will not access the Services through automated or non-human means, whether through a bot, script, or otherwise.</p>
        <p className="mb-2">You will not use the Services for any illegal or unauthorized purpose.</p>
        <p className="mb-2">Your use of the Services will not violate any applicable law or regulation.</p>
        <p className="mb-2">
          If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).
        </p>

        <h2 id="user-registration" className="text-2xl font-semibold mt-6 mb-3">4. USER REGISTRATION</h2>
        <p className="mb-2">
          You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
        </p>

        <h2 id="prohibited-activities" className="text-2xl font-semibold mt-6 mb-3">5. PROHIBITED ACTIVITIES</h2>
        <p className="mb-2">
          Misuse of the platform—such as harassment, impersonation, data scraping, spam, or uploading harmful content—is strictly prohibited.
        </p>
        <p className="mb-2">
          You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
        </p>
        <p className="mb-2">As a user of the Services, you agree not to:</p>
        <p className="mb-2">Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</p>
        <p className="mb-2">Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</p>
        <p className="mb-2">Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</p>
        <p className="mb-2">Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</p>
        <p className="mb-2">Use any information obtained from the Services in order to harass, abuse, or harm another person.</p>
        <p className="mb-2">Make improper use of our support services or submit false reports of abuse or misconduct.</p>
        <p className="mb-2">Use the Services in a manner inconsistent with any applicable laws or regulations.</p>
        <p className="mb-2">Engage in unauthorized framing of or linking to the Services.</p>
        <p className="mb-2">Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party’s uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.</p>
        <p className="mb-2">Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</p>
        <p className="mb-2">Delete the copyright or other proprietary rights notice from any Content.</p>
        <p className="mb-2">Attempt to impersonate another user or person or use the username of another user.</p>
        <p className="mb-2">Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats ('gifs'), 1×1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as 'spyware' or 'passive collection mechanisms' or 'pcms').</p>
        <p className="mb-2">Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</p>
        <p className="mb-2">Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</p>
        <p className="mb-2">Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</p>
        <p className="mb-2">Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</p>
        <p className="mb-2">Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</p>
        <p className="mb-2">Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorized script or other software.</p>
        <p className="mb-2">Use a buying agent or purchasing agent to make purchases on the Services.</p>
        <p className="mb-2">Make any unauthorized use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</p>
        <p className="mb-2">Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.</p>
        <p className="mb-2">Use the Services to advertise or offer to sell goods and services.</p>
        <p className="mb-2">Sell or otherwise transfer your profile.</p>
        <p className="mb-2">All content and materials on Reactlyve, including but not limited to text, graphics, logos, and software, are the property of Reactlyve or its licensors.</p>
        <p className="mb-2">You agree not to use the service for any unlawful or prohibited activities.</p>

        <h2 id="user-generated-contributions" className="text-2xl font-semibold mt-6 mb-3">6. USER GENERATED CONTRIBUTIONS</h2>
        <p className="mb-2">
          The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, '<strong>Contributions</strong>'). Contributions may be viewable by other users of the Services and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and nonproprietary.
        </p>
        <p className="mb-2">When you create or make available any Contributions, you thereby represent and warrant that:</p>
        <p className="mb-2">The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</p>
        <p className="mb-2">You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.</p>
        <p className="mb-2">You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.</p>
        <p className="mb-2">Your Contributions are not false, inaccurate, or misleading.</p>
        <p className="mb-2">Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.</p>
        <p className="mb-2">Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).</p>
        <p className="mb-2">Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</p>
        <p className="mb-2">Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.</p>
        <p className="mb-2">Your Contributions do not violate any applicable law, regulation, or rule.</p>
        <p className="mb-2">Your Contributions do not violate the privacy or publicity rights of any third party.</p>
        <p className="mb-2">Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or wellbeing of minors.</p>
        <p className="mb-2">Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.</p>
        <p className="mb-2">Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.</p>
        <p className="mb-4">
            We retain ownership over the platform but you retain full ownership of any content you contribute. By uploading Contributions, you grant us a limited, non-exclusive, royalty-free licence to host, display, and use the Contributions in connection with providing the Services and for limited promotional purposes. We will never commercially exploit your content beyond this scope.
        </p>
        <p className="mb-2">Any use of the Services in violation of the foregoing violates these Legal Terms and may result in, among other things, termination or suspension of your rights to use the Services.</p>

        <h2 id="contribution-licence" className="text-2xl font-semibold mt-6 mb-3">7. CONTRIBUTION LICENSE</h2>
        <p className="mb-2">
          By posting your Contributions to any part of the Services, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions (including, without limitation, your image and voice) for any purpose consistent with the scope outlined in Section 6, such as operating, promoting, and improving the Services, and to prepare derivative works of, or incorporate into other works, such Contributions, and grant and authorize sublicenses of the foregoing. The use and distribution may occur in any media formats and through any media channels.
        </p>
        <p className="mb-2">
          This license will apply to any form, media, or technology now known or hereafter developed, and includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide. You waive all moral rights in your Contributions, and you warrant that moral rights have not otherwise been asserted in your Contributions.
        </p>
        <p className="mb-2">
          We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.
        </p>
        <p className="mb-2">
          We have the right, in our sole and absolute discretion, (1) to edit, redact, or otherwise change any Contributions; (2) to re-categorize any Contributions to place them in more appropriate locations on the Services; and (3) to pre-screen or delete any Contributions at any time and for any reason, without notice. We have no obligation to monitor your Contributions.
        </p>

        <h2 id="services-management" className="text-2xl font-semibold mt-6 mb-3">8. SERVICES MANAGEMENT</h2>
        <p className="mb-2">We reserve the right, but not the obligation, to:</p>
        <p className="mb-2">Monitor the Services for violations of these Legal Terms;</p>
        <p className="mb-2">Use automated content moderation services, including AWS Rekognition, to scan images and videos you upload for material that may violate these Legal Terms;</p>
        <p className="mb-2">Take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities;</p>
        <p className="mb-2">In our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof;</p>
        <p className="mb-2">In our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and</p>
        <p className="mb-2">Otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.</p>

        <h2 id="privacy-policy-terms" className="text-2xl font-semibold mt-6 mb-3">9. PRIVACY POLICY</h2>
        <p className="mb-2">
          We care about data privacy and security. By using the Services, you agree to be bound by our Privacy Policy posted on the Services, which is incorporated into these Legal Terms.
        </p>
        <p className="mb-2">
          Please be advised the Services are hosted in Germany. If you access the Services from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in Germany, then through your continued use of the Services, you are transferring your data to Germany, and you expressly consent to have your data transferred to and processed in Germany.
        </p>

        <h2 id="copyright-infringements" className="text-2xl font-semibold mt-6 mb-3">10. COPYRIGHT INFRINGEMENTS</h2>
        <p className="mb-2">
          We respect the intellectual property rights of others. If you believe that any material available on or through the Services infringes upon any copyright you own or control, please immediately notify us using the contact information provided below (a '<strong>Notification</strong>').
        </p>
        <p className="mb-2">
          A copy of your Notification will be sent to the person who posted or stored the material addressed in the Notification. Please be advised that pursuant to applicable law, you may be held liable for damages if you make material misrepresentations in a Notification. Thus, if you are not sure that material located on or linked to by the Services infringes your copyright, you should consider first contacting an attorney.
        </p>

        <h2 id="term-and-termination" className="text-2xl font-semibold mt-6 mb-3">11. TERM AND TERMINATION</h2>
        <p className="mb-2">
          These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION.
        </p>
        <p className="mb-2">
          WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION. Accounts that have been inactive for 12 consecutive months may be permanently deleted without prior notice. Data associated with such accounts will also be deleted.
        </p>
        <p className="mb-2">
          If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.
        </p>

        <h2 id="modifications-and-interruptions" className="text-2xl font-semibold mt-6 mb-3">12. MODIFICATIONS AND INTERRUPTIONS</h2>
        <p className="mb-2">
          We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.
        </p>
        <p className="mb-2">
          We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services.
        </p>
        <p className="mb-2">
          Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.
        </p>

        <h2 id="governing-law" className="text-2xl font-semibold mt-6 mb-3">13. GOVERNING LAW</h2>
        <p className="mb-2">
          These Legal Terms are governed by and interpreted following the laws of the United Kingdom, and the use of the United Nations Convention of Contracts for the International Sales of Goods is expressly excluded. If your habitual residence is in the EU, and you are a consumer, you additionally possess the protection provided to you by obligatory provisions of the law in your country of residence. Reactlyve and yourself both agree to submit to the non-exclusive jurisdiction of the courts of England, which means that you may make a claim to defend your consumer protection rights in regards to these Legal Terms in the United Kingdom, or in the EU country in which you reside.
        </p>

        <h2 id="dispute-resolution" className="text-2xl font-semibold mt-6 mb-3">14. DISPUTE RESOLUTION</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">Informal Negotiations</h3>
        <p className="mb-2">
          To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a '<strong>Dispute</strong>' and collectively, the '<strong>Disputes</strong>') brought by either you or us (individually, a '<strong>Party</strong>' and collectively, the '<strong>Parties</strong>'), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Binding Arbitration</h3>
        <p className="mb-2">
          Any dispute arising from the relationships between the Parties to these Legal Terms shall be determined by one arbitrator who will be chosen in accordance with the Arbitration and Internal Rules of the European Court of Arbitration being part of the European Centre of Arbitration having its seat in Strasbourg, and which are in force at the time the application for arbitration is filed, and of which adoption of this clause constitutes acceptance. The seat of arbitration shall be London, United Kingdom. The language of the proceedings shall be English. Applicable rules of substantive law shall be the law of the United Kingdom.
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Restrictions</h3>
        <p className="mb-2">
          The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilize class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Exceptions to Informal Negotiations and Arbitration</h3>
        <p className="mb-2">
          The Parties agree that the following Disputes are not subject to the above provisions concerning informal negotiations binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorized use; and (c) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.
        </p>

        <h2 id="corrections" className="text-2xl font-semibold mt-6 mb-3">15. CORRECTIONS</h2>
        <p className="mb-2">
          There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
        </p>

        <h2 id="disclaimer" className="text-2xl font-semibold mt-6 mb-3">16. DISCLAIMER</h2>
        <p className="mb-2">
          THE SERVICES ARE PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY:
        </p>
        <p className="mb-2">(1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS;</p>
        <p className="mb-2">(2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES;</p>
        <p className="mb-2">(3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN;</p>
        <p className="mb-2">(4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES;</p>
        <p className="mb-2">(5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY; AND/OR</p>
        <p className="mb-2">(6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES.</p>

        <h2 id="limitations-of-liability" className="text-2xl font-semibold mt-6 mb-3">17. LIMITATIONS OF LIABILITY</h2>
        <p className="mb-2">
          IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p className="mb-2">
          NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE SIX (6) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING. CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.
        </p>

        <h2 id="indemnification" className="text-2xl font-semibold mt-6 mb-3">18. INDEMNIFICATION</h2>
        <p className="mb-2">
          You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys’ fees and expenses, made by any third party due to or arising out of:
        </p>
        <p className="mb-2">Your Contributions;</p>
        <p className="mb-2">Use of the Services;</p>
        <p className="mb-2">Breach of these Legal Terms;</p>
        <p className="mb-2">Any breach of your representations and warranties set forth in these Legal Terms;</p>
        <p className="mb-2">Your violation of the rights of a third party, including but not limited to intellectual property rights; or</p>
        <p className="mb-2">Any overt harmful act toward any other user of the Services with whom you connected via the Services.</p>
        <p className="mb-2">
          Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.
        </p>

        <h2 id="user-data-terms" className="text-2xl font-semibold mt-6 mb-3">19. USER DATA</h2>
        <p className="mb-2">
          We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
        </p>

        <h2 id="electronic-communications" className="text-2xl font-semibold mt-6 mb-3">20. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
        <p className="mb-2">
          Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing.
        </p>
        <p className="mb-2">
          YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.
        </p>

        <h2 id="california-users-and-residents" className="text-2xl font-semibold mt-6 mb-3">21. CALIFORNIA USERS AND RESIDENTS [For US Users Only]</h2>
        <p className="mb-2">This section applies only to users residing in the United States.</p>
        <p className="mb-2">
          If any complaint with us is not satisfactorily resolved, you can contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs in writing at 1625 North Market Blvd., Suite N 112, Sacramento, California 95834 or by telephone at (800) 952-5210 or (916) 445-1254.
        </p>

        <h2 id="miscellaneous" className="text-2xl font-semibold mt-6 mb-3">22. MISCELLANEOUS</h2>
        <p className="mb-2">
          These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control.
        </p>
        <p className="mb-2">
          If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment, or agency relationship created between you and us as a result of these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.
        </p>

        <h2 id="contact-us-terms" className="text-2xl font-semibold mt-6 mb-3">23. CONTACT US</h2>
        <p className="mb-2">
          In order to resolve a complaint regarding the Services or to receive further information regarding the use of the Services, please contact us at:
        </p>
        <p className="mb-2">Reactlyve</p>
        <p className="mb-2">United Kingdom</p>
        <p className="mb-2">
          <a href="mailto:support@reactlyve.com" className="text-blue-600 hover:underline">support@reactlyve.com</a>
        </p>

        <p className="mb-2">📘 Quick Summary – FAQs (Informative Only)<br />These FAQs summarise key points in plain English but do not replace or override the full Terms of Service.</p>
        <h2 id="terms-faqs" className="text-2xl font-semibold mt-6 mb-3">TERMS OF SERVICE – FAQs</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">Q1: What is Reactlyve?</h3>
        <p className="mb-2">Reactlyve is a browser-based app where you can send video, text, or image messages—and capture the recipient's webcam reaction (with their permission).</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Q2: Who can use it?</h3>
        <p className="mb-2">Only users aged 18 or over, or 13+ with parental consent, can register and use Reactlyve.</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Q3: What can’t I do on the platform?</h3>
        <p className="mb-2">No illegal activity, harassment, impersonation, or data scraping. Don’t misuse our services or upload harmful or offensive content.</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Q4: Who owns the content I upload?</h3>
        <p className="mb-2">You do. But by uploading it, you give us permission to display, store, and share it as part of the service.</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Q5: What happens if I break the rules?</h3>
        <p className="mb-2">We may suspend or close your account without notice and may take legal action if necessary.</p>
      </div>
    </MainLayout>
  );
};

export default TermsPage;
