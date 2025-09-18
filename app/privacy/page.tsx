import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ThePreMax",
  description:
    "Learn about how ThePreMax collects, uses, and protects your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Welcome to ThePreMax. We are committed to protecting your
                personal information and your right to privacy. If you have any
                questions or concerns about this privacy policy or our practices
                with regard to your personal information, please contact us at
                info@thepremax.com.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This privacy policy describes how we might use your information
                if you visit our website or make a purchase from us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                2. Information We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect personal information that you voluntarily provide to
                us when you:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Register on the website</li>
                <li>Make a purchase</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us for customer support</li>
                <li>Use our website features</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                The personal information we collect may include: name, email
                address, phone number, billing address, shipping address,
                payment information, and any other information you choose to
                provide.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use your personal information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your account or transactions</li>
                <li>
                  Send you marketing and promotional communications (with your
                  consent)
                </li>
                <li>Improve our website and services</li>
                <li>Provide customer support</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                4. Information Sharing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties without your consent, except in the
                following circumstances:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Service providers who assist us in operating our website and
                  conducting business
                </li>
                <li>Payment processors for secure transaction processing</li>
                <li>Shipping companies for order fulfillment</li>
                <li>Legal compliance when required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security
                measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
                However, no method of transmission over the internet is 100%
                secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Cookies and Tracking
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website uses cookies and similar tracking technologies to
                enhance your browsing experience, analyze website traffic, and
                personalize content. You can control cookie settings through
                your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                7. Your Rights
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the following rights regarding your personal
                information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access your personal information</li>
                <li>Update or correct your information</li>
                <li>Delete your account and personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under 13 years of
                age. We do not knowingly collect personal information from
                children under 13. If you are a parent or guardian and believe
                your child has provided personal information, please contact us
                immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                9. Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new privacy policy on
                this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                10. Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this privacy policy, please
                contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> info@thepremax.com
                </p>
                <p className="text-muted-foreground">
                  <strong>Phone:</strong> +1 512-355-5110
                </p>
                <p className="text-muted-foreground">
                  <strong>Address:</strong> 5900 BALCONES DR 23935, AUSTIN TX
                  78731
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
