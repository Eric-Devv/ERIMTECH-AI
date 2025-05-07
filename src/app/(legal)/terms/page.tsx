import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBadge } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="w-full max-w-3xl mx-auto glassmorphic">
        <CardHeader className="text-center">
          <FileBadge className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-orbitron holographic-text">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-invert dark:prose-invert max-w-none prose-headings:font-orbitron prose-headings:text-primary prose-a:text-primary hover:prose-a:text-primary/80">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

          <p>Please read these Terms of Service (&quot;Terms&quot;, &quot;Terms of Service&quot;) carefully before using the ERIMTECH AI website and services (the &quot;Service&quot;) operated by ERIMTECH AI (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).</p>

          <p>Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service.</p>

          <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.</p>

          <h2>1. Accounts</h2>
          <p>When you create an account with us, you guarantee that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.</p>
          <p>You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.</p>
          <p>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

          <h2>2. Use of Service</h2>
          <p>You agree not to use the Service:</p>
          <ul>
            <li>In any way that violates any applicable national or international law or regulation.</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
            <li>To generate or disseminate content that is unlawful, harmful, defamatory, obscene, abusive, infringing, or otherwise objectionable.</li>
            <li>To engage in any activity that interferes with or disrupts the Service.</li>
            <li>To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service.</li>
            <li>To reverse engineer, decompile, or otherwise attempt to discover the source code or underlying ideas or algorithms of the Service, except to the extent applicable laws specifically prohibit such restriction.</li>
            <li>To misuse our API, including exceeding rate limits or using it for any prohibited activities.</li>
          </ul>

          <h2>3. Intellectual Property</h2>
          <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of ERIMTECH AI and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>
          <p><strong>User Content:</strong> You retain all rights to any content you submit, post, or display on or through the Service (&quot;User Content&quot;). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such User Content in connection with providing and promoting the Service. You represent and warrant that you have all the rights, power, and authority necessary to grant the rights granted herein to any User Content that you submit.</p>
          
          <h2>4. Fees and Payment (If Applicable)</h2>
          <p>Some parts of the Service may be billed on a subscription basis (&quot;Subscription(s)&quot;). You will be billed in advance on a recurring, periodic basis (such as monthly or annually), depending on the type of Subscription plan you select when purchasing the Subscription.</p>
          <p>At the end of each period, your Subscription will automatically renew under the exact same conditions unless you cancel it or ERIMTECH AI cancels it. You may cancel your Subscription renewal either through your online account management page or by contacting customer support.</p>
          <p>A valid payment method, including credit card, is required to process the payment for your Subscription. You shall provide ERIMTECH AI with accurate and complete billing information. By submitting such payment information, you automatically authorize ERIMTECH AI to charge all Subscription fees incurred through your account to any such payment instruments.</p>
          <p>All fees are non-refundable except as required by law or as explicitly stated by us.</p>

          <h2>5. Quotas and Usage Limits</h2>
          <p>Your use of the Service may be subject to quotas or usage limits, which may vary depending on your subscription plan or if you are using a free tier. We reserve the right to limit or suspend your access to the Service if you exceed these quotas. Details of applicable quotas will be provided within the Service or on our pricing page.</p>

          <h2>6. Termination</h2>
          <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
          <p>If you wish to terminate your account, you may simply discontinue using the Service or contact us to delete your account.</p>
          <p>All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>

          <h2>7. Disclaimer of Warranties; Limitation of Liability</h2>
          <p>THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. ERIMTECH AI MAKES NO WARRANTIES, EXPRESSED OR IMPLIED, AND HEREBY DISCLAIMS AND NEGATES ALL OTHER WARRANTIES INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT OF INTELLECTUAL PROPERTY OR OTHER VIOLATION OF RIGHTS.</p>
          <p>IN NO EVENT SHALL ERIMTECH AI OR ITS SUPPLIERS BE LIABLE FOR ANY DAMAGES (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF DATA OR PROFIT, OR DUE TO BUSINESS INTERRUPTION) ARISING OUT OF THE USE OR INABILITY TO USE THE SERVICE, EVEN IF ERIMTECH AI OR AN ERIMTECH AI AUTHORIZED REPRESENTATIVE HAS BEEN NOTIFIED ORALLY OR IN WRITING OF THE POSSIBILITY OF SUCH DAMAGE.</p>
          <p>Our AI models strive for accuracy, but we do not guarantee the accuracy, completeness, or usefulness of any information generated by the Service. You acknowledge that any reliance on such information is at your own risk.</p>

          <h2>8. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction, e.g., State of California, USA], without regard to its conflict of law provisions.</p>

          <h2>9. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
          <p>By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.</p>

          <h2>10. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at: <a href="mailto:support@erimtech.ai">support@erimtech.ai</a> (Replace with actual contact).</p>
        </CardContent>
      </Card>
    </div>
  );
}
