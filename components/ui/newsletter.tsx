"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section, Container, SectionHeader } from "@/components/ui/layout";
import { cn } from "@/lib/utils";
import { Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface NewsletterProps {
  className?: string;
  variant?: "default" | "accent" | "minimal" | "card";
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
}

export function Newsletter({
  className,
  variant = "default",
  title = "Stay In Style",
  subtitle = "Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and style tips.",
  placeholder = "Enter your email",
  buttonText = "Subscribe",
}: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubscribed(true);
    setIsLoading(false);
    toast.success("Successfully subscribed to newsletter!");
    setEmail("");
  };

  const variants = {
    default: {
      section: "bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10",
      container: "text-center",
      content: "max-w-2xl mx-auto space-y-6",
      form: "flex flex-col sm:flex-row gap-4 max-w-md mx-auto",
      input: "flex-1 h-12",
      button: "h-12 px-8",
    },
    accent: {
      section: "bg-accent text-accent-foreground",
      container: "text-center",
      content: "max-w-2xl mx-auto space-y-6",
      form: "flex flex-col sm:flex-row gap-4 max-w-md mx-auto",
      input: "flex-1 h-12 bg-background text-foreground",
      button:
        "h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90",
    },
    minimal: {
      section: "",
      container: "text-center",
      content: "max-w-xl mx-auto space-y-4",
      form: "flex flex-col sm:flex-row gap-3 max-w-sm mx-auto",
      input: "flex-1",
      button: "px-6",
    },
    card: {
      section: "",
      container: "",
      content:
        "p-8 rounded-xl bg-card shadow-fashion-md border border-border space-y-6 max-w-lg mx-auto text-center",
      form: "space-y-4",
      input: "w-full",
      button: "w-full",
    },
  };

  const variantStyles = variants[variant];

  if (isSubscribed) {
    return (
      <Section
        variant={variant === "accent" ? "default" : undefined}
        className={className}
      >
        <Container>
          <div
            className={cn(variantStyles.content, "flex flex-col items-center")}
          >
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-heading font-bold text-primary mb-2">
              Thank You!
            </h3>
            <p className="text-muted-foreground">
              You&apos;ve successfully subscribed to our newsletter.
            </p>
          </div>
        </Container>
      </Section>
    );
  }

  const content = (
    <div className={variantStyles.content}>
      {variant !== "minimal" && (
        <SectionHeader
          title={title}
          subtitle={subtitle}
          showDivider={variant === "default"}
          className="mb-6"
        />
      )}

      {variant === "minimal" && (
        <>
          <h3 className="text-xl font-semibold text-primary">{title}</h3>
          <p className="text-muted-foreground">{subtitle}</p>
        </>
      )}

      <form onSubmit={handleSubmit} className={variantStyles.form}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn("pl-10", variantStyles.input)}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          variant={variant === "accent" ? "default" : "accent"}
          className={variantStyles.button}
        >
          {isLoading ? "Subscribing..." : buttonText}
        </Button>
      </form>
    </div>
  );

  if (variant === "card") {
    return <div className={className}>{content}</div>;
  }

  return (
    <Section
      variant={variant === "accent" ? "default" : undefined}
      className={cn(variantStyles.section, className)}
    >
      <Container className={variantStyles.container}>{content}</Container>
    </Section>
  );
}
