"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  Loader2,
} from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useScrollToTop();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        // Handle validation errors
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details
            .map((detail: { message: string }) => detail.message)
            .join(", ");
          toast.error(errorMessages);
        } else {
          toast.error(
            data.error || "Failed to send message. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6">
              Get in <span className="text-accent">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Have questions about our products or need assistance? We&apos;re
              here to help! Reach out to us through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-0 shadow-fashion-product">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-4">
                  Visit Our Store
                </h3>
                <p className="text-muted-foreground">
                  5900 BALCONES DR 23935
                  <br />
                  AUSTIN TX 78731
                  <br />
                  United States
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-fashion-product">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-4">
                  Call Us
                </h3>
                <p className="text-muted-foreground">
                  +1 512-355-5110
                  <br />
                  Available 9 AM - 9 PM CST
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-fashion-product">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-4">
                  Email Us
                </h3>
                <p className="text-muted-foreground">
                  info@thepremax.com
                  <br />
                  support@thepremax.com
                  <br />
                  Response within 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form and Additional Info */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card id="contact-form" className="border-0 shadow-fashion-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-accent" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className={`space-y-6 ${
                    isSubmitting ? "opacity-75 pointer-events-none" : ""
                  }`}
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="mb-2 block">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="mb-2 block">
                        Email Address{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="mb-2 block">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What is this regarding?"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="mb-2 block">
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="space-y-8">
              {/* Business Hours */}
              <Card className="border-0 shadow-fashion-product">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Monday - Friday
                    </span>
                    <span className="font-medium">9:00 AM - 9:00 PM</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">10:00 AM - 8:00 PM</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">12:00 PM - 6:00 PM</span>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Support */}
              <Card className="border-0 shadow-fashion-product">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-accent" />
                    Customer Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Quick Response</h4>
                    <p className="text-muted-foreground text-sm">
                      We typically respond to emails within 24 hours during
                      business days.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Phone Support</h4>
                    <p className="text-muted-foreground text-sm">
                      Live customer support available during business hours for
                      immediate assistance.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Order Tracking</h4>
                    <p className="text-muted-foreground text-sm">
                      Need help with your order? We can track your shipment and
                      provide real-time updates.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our products, shipping,
              returns, and more.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <Card className="border-0 shadow-fashion-product">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      How do I place an order?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Simply browse our products, add items to your cart, and
                      proceed to checkout. You can create an account or checkout
                      as a guest.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-fashion-product">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      What payment methods do you accept?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We accept all major credit cards (Visa, MasterCard,
                      American Express), PayPal, and bank transfers for your
                      convenience.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-fashion-product">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      How long does shipping take?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Standard shipping takes 3-5 business days, while express
                      shipping takes 1-2 business days. International shipping
                      may take 7-14 days.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-fashion-product">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Can I track my order?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes! Once your order ships, you&apos;ll receive a tracking
                      number via email to monitor your package&apos;s progress.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <Card className="border-0 shadow-fashion-product">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      What is your return policy?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We offer a 30-day return policy for unused items in
                      original packaging. Contact us within 30 days of delivery
                      to initiate a return.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-fashion-product">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Do you ship internationally?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes, we ship to most countries worldwide. International
                      shipping rates and delivery times vary by destination.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-fashion-product">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      How can I contact customer support?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      You can reach us via email, phone, or the contact form
                      above. We typically respond within 24 hours during
                      business days.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-fashion-product">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Do you offer bulk discounts?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes! We offer special pricing for bulk orders. Contact our
                      sales team for custom quotes on large quantity orders.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="text-center mt-12">
              <Card className="border-0 shadow-fashion-product bg-accent/5">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Still have questions?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Can&apos;t find what you&apos;re looking for? Our support
                    team is here to help!
                  </p>
                  <Button asChild>
                    <a href="#contact-form">Contact Us</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
