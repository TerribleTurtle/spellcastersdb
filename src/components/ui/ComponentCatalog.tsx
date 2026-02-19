"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SmartRankBadge } from "@/components/ui/rank-badge";

export function ComponentCatalog() {
  return (
    <div className="space-y-12">
      {/* Buttons */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">
          Buttons
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">Icon</Button>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">
          Cards
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-muted">
                This is content inside a card. It uses surface-card background.
              </p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          <div className="bg-surface-card p-4 rounded-lg border border-border-default">
            <h4 className="font-bold text-text-primary mb-2">
              Manual Surface Card
            </h4>
            <p className="text-text-secondary text-sm">
              Testing raw classes without shadcn Card component wrapper.
            </p>
          </div>
        </div>
      </section>

      {/* Badges & Ranks */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">
          Badges
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          <Badge>Default Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
        <div className="flex flex-wrap gap-4 items-center mt-4">
          <SmartRankBadge rank="I" />
          <SmartRankBadge rank="II" />
          <SmartRankBadge rank="III" />
          <SmartRankBadge rank="IV" />
          <SmartRankBadge rank="V" isTitan />
        </div>
      </section>

      {/* Inputs (using native or shadcn) - assuming Input is available or just standard HTML */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">
          Inputs
        </h3>
        <div className="max-w-md space-y-4">
          <Input placeholder="Default Input" />
          <div className="flex items-center gap-2">
            <Input placeholder="With Button" />
            <Button>Submit</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
