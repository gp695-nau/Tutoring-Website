import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Calendar, Lock, CheckCircle2, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";

import professorImg1 from "@assets/stock_images/professional_male_pr_81e546a5.jpg";

export default function Payments() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("4532 1234 5678 9012");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [cardName, setCardName] = useState("Gnaneswari");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setPaymentSuccess(true);
    
    toast({
      title: "Payment Successful!",
      description: "Your tutoring session has been booked and paid for.",
    });
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-card-border overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500"></div>
          <CardContent className="p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Payment Successful!</h1>
              <p className="text-lg text-muted-foreground">
                Thank you for your payment. Your tutoring session is confirmed.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-left">
              <h3 className="font-semibold text-foreground">Transaction Details</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-foreground">#TXN-2024-78432</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-foreground">$75.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="text-foreground">Visa ending in 9012</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-4 flex items-center gap-4">
              <img
                src={professorImg1}
                alt="Tutor"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="text-left">
                <p className="font-medium text-foreground">Session with Dr. Michael Chen</p>
                <p className="text-sm text-muted-foreground">Mathematics - 1 hour session</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full" data-testid="button-back-dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/my-sessions" className="flex-1">
                <Button className="w-full" data-testid="button-view-sessions">
                  View My Sessions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complete Payment</h1>
          <p className="text-muted-foreground">Secure payment for your tutoring session</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Enter your card information to complete the payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  data-testid="input-card-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="pl-10"
                    data-testid="input-card-number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="pl-10"
                      data-testid="input-expiry"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="pl-10"
                      type="password"
                      data-testid="input-cvv"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                  data-testid="button-pay"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pay $75.00
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Lock className="h-3 w-3" />
                <span>Secured by 256-bit SSL encryption</span>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <img
                  src={professorImg1}
                  alt="Tutor"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-foreground">Mathematics Tutoring</h3>
                  <p className="text-sm text-muted-foreground">with Dr. Michael Chen</p>
                  <p className="text-sm text-muted-foreground">1 hour session</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session Fee</span>
                  <span className="text-foreground">$65.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="text-foreground">$10.00</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">$75.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">100% Satisfaction Guarantee</p>
                  <p className="text-muted-foreground">
                    Not satisfied with your session? Get a full refund within 24 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
