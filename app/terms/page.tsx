import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ThePreMax",
  description:
    "Read our terms of service to understand your rights and obligations when using ThePreMax.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Terms of Service
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
                1. Agreement to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By accessing and using ThePreMax website, you accept and agree
                to be bound by the terms and provision of this agreement. These
                Terms of Service (&quot;Terms&quot;) govern your use of our
                website and services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                2. Description of Service
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ThePreMax provides an online e-commerce platform for purchasing
                fashion items including clothing, accessories, and perfumes. Our
                services include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Online catalog browsing</li>
                <li>Product purchasing and checkout</li>
                <li>User account management</li>
                <li>Customer support services</li>
                <li>Newsletter and promotional communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                3. User Account and Registration
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain features of our service, you may be required
                to create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>
                  Maintain and update your information to keep it accurate
                </li>
                <li>Keep your password confidential and secure</li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                4. Orders and Payment
              </h2>
              <h3 className="text-xl font-medium text-foreground mb-3">
                4.1 Order Process
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you place an order, you are making an offer to purchase
                products. All orders are subject to acceptance by us. We reserve
                the right to refuse or cancel any order for any reason.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">
                4.2 Pricing
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All prices are displayed in US Dollars (USD) and are subject to
                change without notice. We reserve the right to modify prices at
                any time.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">
                4.3 Payment
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Payment must be made at the time of order placement. We accept
                various payment methods as indicated on our website. All payment
                information is processed securely.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. Shipping and Delivery
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We will make every effort to deliver products within the
                estimated timeframe. However, delivery dates are estimates and
                not guaranteed. Shipping costs and delivery times may vary based
                on location and product availability.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Risk of loss and title for products pass to you upon delivery to
                the shipping carrier.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Returns and Refunds
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We want you to be satisfied with your purchase. Our return
                policy includes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Returns must be initiated within 30 days of delivery</li>
                <li>Items must be unused and in original packaging</li>
                <li>Custom or personalized items may not be returnable</li>
                <li>Return shipping costs may apply</li>
                <li>Refunds will be processed within 7-10 business days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                7. Prohibited Uses
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You may not use our service:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  For any unlawful purpose or to solicit others to unlawful acts
                </li>
                <li>
                  To violate any international, federal, provincial, or state
                  regulations, rules, laws, or local ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights
                  or the intellectual property rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage,
                  intimidate, or discriminate
                </li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All content on this website, including but not limited to text,
                graphics, logos, images, and software, is the property of
                ThePreMax and is protected by copyright and other intellectual
                property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may not reproduce, distribute, modify, or create derivative
                works of any content without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                9. Disclaimer of Warranties
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website and services are provided &quot;as is&quot; without
                any representations or warranties of any kind. We disclaim all
                warranties, express or implied, including but not limited to
                merchantability, fitness for a particular purpose, and
                non-infringement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                10. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall ThePreMax be liable for any indirect,
                incidental, special, consequential, or punitive damages,
                including but not limited to loss of profits, data, or goodwill,
                arising out of your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                11. Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with the laws of New York State, United States, without regard
                to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                12. Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. Changes
                will be effective immediately upon posting on our website. Your
                continued use of our services constitutes acceptance of the
                modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                13. Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please
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
