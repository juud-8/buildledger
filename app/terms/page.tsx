import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto pt-16 pb-20 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: April 22, 2024</p>
        </div>

        <Card className="p-6">
          <div className="prose prose-invert max-w-none">
            <p>
              Welcome to BuildLedger. These Terms of Service ("Terms") govern your access to and use of the BuildLedger
              platform, including any websites, mobile applications, and other online services (collectively, the
              "Service") provided by BuildLedger, Inc. ("BuildLedger," "we," "us," or "our"). Please read these Terms
              carefully before using our Service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. If you do
              not agree to these Terms, you may not access or use the Service. If you are accessing or using the Service
              on behalf of a company or other legal entity, you represent that you have the authority to bind such
              entity to these Terms, in which case "you" or "your" shall refer to such entity.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Changes to Terms</h2>
            <p>
              We may modify these Terms at any time, in our sole discretion. If we do so, we will notify you by updating
              the "Last Updated" date at the top of these Terms and, in some cases, we may provide you with additional
              notice. Your continued use of the Service after the updated Terms have been posted constitutes your
              acceptance of the updated Terms.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Account Registration</h2>
            <p>
              To use certain features of the Service, you may be required to register for an account. You agree to
              provide accurate, current, and complete information during the registration process and to update such
              information to keep it accurate, current, and complete. You are responsible for safeguarding your account
              credentials and for all activities that occur under your account. You agree to notify us immediately of
              any unauthorized use of your account.
            </p>
            <p className="mt-4">
              We reserve the right to disable your account at any time, including if you have violated these Terms or if
              we determine, in our sole discretion, that your use of the Service poses a risk to the Service or other
              users.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Use of the Service</h2>
            <p>
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable,
              non-sublicensable license to access and use the Service for your personal or internal business purposes.
            </p>
            <p className="mt-4">You agree not to:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Use the Service in any way that violates any applicable law or regulation</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to probe, scan, or test the vulnerability of the Service or any related system or network</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Attempt to gain unauthorized access to the Service or related systems or networks</li>
              <li>Use any robot, spider, crawler, scraper, or other automated means to access the Service</li>
              <li>Bypass or circumvent measures we may use to prevent or restrict access to the Service</li>
              <li>Decompile, reverse engineer, or otherwise attempt to obtain the source code of the Service</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">User Content</h2>
            <p>
              The Service may allow you to upload, submit, store, send, or receive content, including text, images, and
              data ("User Content"). You retain all rights in and to your User Content, and you are solely responsible
              for your User Content and the consequences of submitting and publishing your User Content on the Service.
            </p>
            <p className="mt-4">
              By submitting User Content to the Service, you grant BuildLedger a worldwide, non-exclusive, royalty-free
              license (with the right to sublicense) to use, copy, reproduce, process, adapt, modify, publish, transmit,
              display, and distribute such User Content in any and all media or distribution methods now known or later
              developed, for the purpose of providing and improving the Service.
            </p>
            <p className="mt-4">You represent and warrant that:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>You own or have the necessary rights to your User Content</li>
              <li>
                Your User Content does not violate the rights of any third party, including intellectual property rights
                and privacy rights
              </li>
              <li>Your User Content complies with these Terms and all applicable laws and regulations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive
              property of BuildLedger and its licensors. The Service is protected by copyright, trademark, and other
              laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in
              connection with any product or service without the prior written consent of BuildLedger.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Subscription and Billing</h2>
            <p>
              Some features of the Service may require a subscription. By subscribing to the Service, you agree to pay
              the subscription fees as described at the time of purchase. Subscription fees are non-refundable except as
              required by law or as explicitly stated in these Terms.
            </p>
            <p className="mt-4">
              We may change the fees for the Service at any time, but any price changes will apply to billing cycles
              after the current cycle. We will provide you with reasonable notice of any change in fees.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, for
              any reason, including if you breach these Terms. Upon termination, your right to use the Service will
              immediately cease.
            </p>
            <p className="mt-4">
              You may terminate your account at any time by contacting us. If you terminate your account, you will
              remain liable for all amounts due up to and including the date of termination.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, TITLE, AND NON-INFRINGEMENT. BUILDLEDGER DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED
              OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE OR THE SERVERS THAT MAKE IT AVAILABLE
              ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
            <p>
              IN NO EVENT SHALL BUILDLEDGER, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE TO YOU FOR ANY
              DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES WHATSOEVER RESULTING FROM ANY
              (I) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT, (II) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE
              WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICE, (III) ANY UNAUTHORIZED ACCESS TO OR USE
              OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN,
              (IV) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICE, (V) ANY BUGS, VIRUSES, TROJAN
              HORSES, OR THE LIKE, WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICE BY ANY THIRD PARTY, AND/OR (VI)
              ANY ERRORS OR OMISSIONS IN ANY CONTENT OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF YOUR
              USE OF ANY CONTENT POSTED, EMAILED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICE, WHETHER
              BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT BUILDLEDGER IS ADVISED OF
              THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mt-4">
              THE FOREGOING LIMITATION OF LIABILITY SHALL APPLY TO THE FULLEST EXTENT PERMITTED BY LAW IN THE APPLICABLE
              JURISDICTION. YOU SPECIFICALLY ACKNOWLEDGE THAT BUILDLEDGER SHALL NOT BE LIABLE FOR USER CONTENT OR THE
              DEFAMATORY, OFFENSIVE, OR ILLEGAL CONDUCT OF ANY THIRD PARTY AND THAT THE RISK OF HARM OR DAMAGE FROM THE
              FOREGOING RESTS ENTIRELY WITH YOU.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless BuildLedger, its officers, directors, employees, and
              agents, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and
              expenses (including but not limited to attorney's fees) arising from: (i) your use of and access to the
              Service; (ii) your violation of any term of these Terms; (iii) your violation of any third-party right,
              including without limitation any copyright, property, or privacy right; or (iv) any claim that your User
              Content caused damage to a third party. This defense and indemnification obligation will survive these
              Terms and your use of the Service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Pennsylvania,
              without regard to its conflict of law provisions. You agree to submit to the personal and exclusive
              jurisdiction of the courts located within Pittsburgh, Pennsylvania.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Entire Agreement</h2>
            <p>
              These Terms, together with the Privacy Policy, constitute the entire agreement between you and BuildLedger
              regarding the Service and supersede all prior and contemporaneous written or oral agreements between you
              and BuildLedger.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <div className="mt-4 p-4 bg-secondary rounded-md">
              <p className="font-medium">BuildLedger, Inc.</p>
              <p>Email: legal@buildledger.com</p>
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
