import "./globals.css";

export const metadata = {
  title: "Prompt Zero",
  description: "Get your thinking out of your head before AI has a chance to reshape it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-parchment font-serif text-warm-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
