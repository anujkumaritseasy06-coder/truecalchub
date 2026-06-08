import { constructMetadata } from "@/lib/seo";
import { ContactPageSchema } from "@/components/seo/Schema";
import { Mail, MessageSquare, Bug, Calculator, Briefcase, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata = constructMetadata({
  title: "Contact TrueCalcHub | Support & Feedback",
  description: "Get in touch with the TrueCalcHub team for support, bug reports, calculator requests, or business inquiries.",
  url: "/contact",
});

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center w-full bg-background">
      <ContactPageSchema />
      
      {/* Contact Hero */}
      <section className="w-full bg-secondary-50 dark:bg-secondary-900/50 py-16 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Breadcrumbs items={[{ name: "Contact Us", url: "/contact" }]} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto leading-relaxed">
            Whether you have a question about a formula, spotted a bug, or want to suggest a new tool, we're here to listen.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-4xl mx-auto py-16 px-4">
        
        {/* Contact Information & Response Expectation */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 mb-12 border border-primary-100 dark:border-primary-800/30 text-center flex flex-col items-center">
          <div className="bg-primary-100 dark:bg-primary-800 p-4 rounded-full mb-6 text-primary-600 dark:text-primary-300">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Direct Email Support</h2>
          <a href="mailto:anujkumaritseasy06@gmail.com" className="text-xl text-primary-600 font-bold hover:underline mb-4">
            anujkumaritseasy06@gmail.com
          </a>
          <div className="flex items-center text-secondary-600 dark:text-secondary-400 bg-background/50 dark:bg-background/20 px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4 mr-2" />
            We typically respond within 2–5 business days.
          </div>
        </div>

        {/* Inquiry Types */}
        <h2 className="text-2xl font-bold text-center mb-8">How Can We Help You?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Feedback */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center mb-4 text-foreground">
              <MessageSquare className="h-6 w-6 mr-3 text-blue-500" />
              <h3 className="text-xl font-bold">General Feedback</h3>
            </div>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4 flex-grow">
              Have suggestions on how to improve TrueCalcHub? We constantly refine our UI and user experience based on your input.
            </p>
            <a href="mailto:anujkumaritseasy06@gmail.com?subject=TrueCalcHub Feedback" className="text-sm font-bold text-primary-600 hover:underline">
              Send Feedback &rarr;
            </a>
          </div>

          {/* Bug Report */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center mb-4 text-foreground">
              <Bug className="h-6 w-6 mr-3 text-red-500" />
              <h3 className="text-xl font-bold">Bug Report</h3>
            </div>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4 flex-grow">
              If a calculation seems incorrect or a page is broken, please let us know. Include the specific calculator URL and the values you inputted.
            </p>
            <a href="mailto:anujkumaritseasy06@gmail.com?subject=Bug Report on TrueCalcHub" className="text-sm font-bold text-primary-600 hover:underline">
              Report a Bug &rarr;
            </a>
          </div>

          {/* Calculator Request */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center mb-4 text-foreground">
              <Calculator className="h-6 w-6 mr-3 text-emerald-500" />
              <h3 className="text-xl font-bold">Calculator Request</h3>
            </div>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4 flex-grow">
              Need a specific formula that isn't on our site yet? We build our roadmap based directly on user requests. Tell us what you need!
            </p>
            <a href="mailto:anujkumaritseasy06@gmail.com?subject=New Calculator Request" className="text-sm font-bold text-primary-600 hover:underline">
              Request a Tool &rarr;
            </a>
          </div>

          {/* Business Inquiry */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center mb-4 text-foreground">
              <Briefcase className="h-6 w-6 mr-3 text-purple-500" />
              <h3 className="text-xl font-bold">Business Inquiries</h3>
            </div>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4 flex-grow">
              Interested in partnerships, advertising, or acquiring white-label calculator widgets for your own website? Reach out to our business team.
            </p>
            <a href="mailto:anujkumaritseasy06@gmail.com?subject=Business Inquiry - TrueCalcHub" className="text-sm font-bold text-primary-600 hover:underline">
              Contact Business Team &rarr;
            </a>
          </div>

        </div>

      </section>
    </div>
  );
}
