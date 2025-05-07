import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="w-full max-w-3xl mx-auto glassmorphic">
        <CardHeader className="text-center">
          <ScrollText className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-orbitron holographic-text">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-invert dark:prose-invert max-w-none prose-headings:font-orbitron prose-headings:text-primary prose-a:text-primary hover:prose-a:text-primary/80">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

          <p>Welcome to ERIMTECH AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, the &quot;Services&quot;).</p>

          <h2>1. Information We Collect</h2>
          <p>We may collect personal information that you voluntarily provide to us when you register for an account, use our Services, or communicate with us. This may include:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, password, and other registration details.</li>
            <li><strong>Usage Data:</strong> Information about how you use our Services, such as prompts, generated content, features used, and API usage logs.</li>
            <li><strong>Uploaded Content:</strong> Files (images, audio, video) you upload for processing by our AI features.</li>
            <li><strong>Payment Information:</strong> If you subscribe to a paid plan, we (or our third-party payment processors) may collect payment details. We do not store full credit card numbers.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, operating system, device information, and cookies.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain our Services.</li>
            <li>Improve, personalize, and expand our Services.</li>
            <li>Understand and analyze how you use our Services.</li>
            <li>Develop new products, services, features, and functionality.</li>
            <li>Communicate with you, including for customer service, updates, and marketing purposes.</li>
            <li>Process your transactions.</li>
            <li>Manage your account and enforce our terms and quotas.</li>
            <li>Prevent fraud and ensure the security of our Services.</li>
            <li>Comply with legal obligations.</li>
          </ul>
          <p><strong>AI Model Training:</strong> We may use anonymized and aggregated data to improve our AI models. We will not use your personally identifiable information or specific uploaded content for training general AI models without your explicit consent, unless it is necessary for providing the service (e.g., fine-tuning a model for your specific use case if offered).</p>


          <h2>3. Sharing Your Information</h2>
          <p>We do not sell your personal information. We may share your information in the following situations:</p>
          <ul>
            <li><strong>With Service Providers:</strong> We may share your information with third-party vendors and service providers that perform services for us or on our behalf, such as Firebase (for authentication, database, storage), AI API providers (OpenAI, Google Gemini), payment processors, and hosting providers. These providers are obligated to protect your information.</li>
            <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
            <li><strong>To Protect Rights:</strong> We may disclose information where we believe it necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person and illegal activities, or as evidence in litigation.</li>
            <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>We implement a variety of security measures to maintain the safety of your personal information. However, no electronic transmission or storage of information can be guaranteed to be 100% secure. We strive to use commercially acceptable means to protect your personal information but cannot guarantee its absolute security.</p>

          <h2>5. Data Retention</h2>
          <p>We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.</p>

          <h2>6. Your Data Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, delete, or restrict its use. Please contact us to exercise these rights. (Further details on how to exercise rights would be included based on specific legal requirements like GDPR, CCPA).</p>
          
          <h2>7. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar tracking technologies to track activity on our Services and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Services.</p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>Our Services are not intended for use by children under the age of 13 (or a higher age threshold as required by applicable law). We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.</p>

          <h2>9. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.</p>

          <h2>10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@erimtech.ai">privacy@erimtech.ai</a> (Replace with actual contact).</p>
        </CardContent>
      </Card>
    </div>
  );
}
