import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function AboutPage() {

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">About Unleashed</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We believe fashion should be an expression of your authentic self.
          Our mission is to provide premium, sustainable clothing that empowers
          you to unleash your unique style.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Founded in 2018, Unleashed began as a small boutique with a big vision:
              to create clothing that doesn't just look good, but feels good to wear
              and good to buy.
            </p>
            <p>
              We started with a simple principle - quality over quantity. Every piece
              in our collection is carefully selected for its craftsmanship, comfort,
              and style. We work directly with ethical manufacturers who share our
              commitment to fair labor practices and environmental responsibility.
            </p>
            <p>
              Today, we're proud to serve customers worldwide while maintaining our
              core values of quality, sustainability, and authentic style.
            </p>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
            alt="Our Story"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary-foreground">🌱</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Sustainability</h3>
              <p className="text-muted-foreground">
                We're committed to reducing our environmental impact through
                sustainable materials and ethical manufacturing practices.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary-foreground">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Quality</h3>
              <p className="text-muted-foreground">
                Every piece is crafted with attention to detail and built to last,
                ensuring you get the best value for your investment.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary-foreground">💎</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Authenticity</h3>
              <p className="text-muted-foreground">
                We believe in authentic self-expression and create pieces that
                help you showcase your unique personality and style.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Mission Statement */}
      <div className="text-center bg-muted rounded-lg p-12">
        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          "To empower individuals to express their authentic selves through
          thoughtfully designed, sustainably made clothing that doesn't
          compromise on style, quality, or values."
        </p>
      </div>
    </div>
  );
}