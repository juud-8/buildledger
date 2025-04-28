import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto pt-16 pb-20 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 22, 2024</p>
        </div>

        <Card className="p-6">
          <div className="prose prose-invert max-w-none">
            <p>
              At BuildLedger, we take your privacy seriously. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our platform. Please read this privacy policy
              carefully. If you do not agree with the terms of this privacy policy, please do not access the
              application.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>

            <h3 className="text-lg font-medium mt-6 mb-2">Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide to us when you register on the
              BuildLedger platform, express interest in obtaining information about us or our products, or otherwise
              contact us. The personal information we collect may include:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Name, email address, and contact information</li>
              <li>Business information, including business name, address, and tax identification numbers</li>
              <li>Billing information, including payment method details</li>
              <li>Account credentials, such as usernames and passwords</li>
              <li>Preferences and settings related to your use of our platform</li>
            </ul>

            <h3 className="text-lg font-medium mt-6 mb-2">Usage Information</h3>
            <p>
              We automatically collect certain information when you visit, use, or navigate our platform. This
              information does not reveal your specific identity but may include:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>
                Device and usage information, such as your IP address, browser and device characteristics, operating
                system, and language preferences
              </li>
              <li>
                Information about how you use our platform, including your browsing actions, search queries, and
                interaction with features and content
              </li>
              <li>Performance data and error reports to help us improve our platform</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <p>We use the information we collect for various business purposes, including:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Providing, operating, and maintaining our platform</li>
              <li>Improving, personalizing, and expanding our platform</li>
              <li>Understanding and analyzing how you use our platform</li>
              <li>Developing new products, services, features, and functionality</li>
              <li>Communicating with you about updates, security alerts, and support messages</li>
              <li>Providing customer support and responding to your inquiries</li>
              <li>Processing your transactions and managing your account</li>
              <li>Preventing fraudulent activities and enforcing our terms of service</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Data Storage and Security</h2>
            <p>
              We implement appropriate technical and organizational security measures designed to protect the security
              of any personal information we process. However, despite our safeguards and efforts to secure your
              information, no electronic transmission over the Internet or information storage technology can be
              guaranteed to be 100% secure.
            </p>
            <p className="mt-4">
              We store your personal information for as long as needed to provide you with our services and for
              legitimate and essential business purposes, such as maintaining the performance of our platform, making
              data-driven business decisions, complying with our legal obligations, and resolving disputes.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Cookies and Tracking Technologies</h2>
            <p>
              We may use cookies, web beacons, tracking pixels, and other tracking technologies to help customize our
              platform and improve your experience. When you access our platform, your personal information is not
              collected through the use of tracking technology. Most browsers are set to accept cookies by default. You
              can remove or reject cookies, but be aware that such action could affect the availability and
              functionality of our platform.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Third-Party Disclosure</h2>
            <p>
              We may share your information with third parties that perform services for us or on our behalf, including
              payment processing, data analysis, email delivery, hosting services, customer service, and marketing
              assistance.
            </p>
            <p className="mt-4">We may also disclose your information:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>To comply with legal obligations</li>
              <li>To protect and defend our rights or property</li>
              <li>To prevent or investigate possible wrongdoing in connection with the platform</li>
              <li>To protect the personal safety of users of the platform or the public</li>
              <li>To protect against legal liability</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Your Rights and Choices</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, such as:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>The right to access personal information we hold about you</li>
              <li>The right to request correction of inaccurate or incomplete information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to withdraw consent where we rely on consent to process your information</li>
              <li>The right to object to our processing of your personal information</li>
              <li>The right to request restriction of processing of your personal information</li>
              <li>The right to data portability</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us using the information provided in the "Contact Us" section
              below.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Children's Privacy</h2>
            <p>
              Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal
              information from children under 18. If you are a parent or guardian and believe your child has provided us
              with personal information, please contact us so that we can delete such information.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Updates to This Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. The updated version will be indicated by an updated
              "Last Updated" date and the updated version will be effective as soon as it is accessible. We encourage
              you to review this privacy policy frequently to be informed of how we are protecting your information.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>If you have questions or comments about this privacy policy, you may contact us at:</p>
            <div className="mt-4 p-4 bg-secondary rounded-md">
              <p className="font-medium">BuildLedger, Inc.</p>
              <p>Email: privacy@buildledger.com</p>
              <p>Address: 123 Business Avenue, Suite 400, Pittsburgh, PA 15213</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
