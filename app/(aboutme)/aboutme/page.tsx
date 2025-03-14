'use client';

import { Hero } from '@/app/(aboutme)/components/mehero';
import { ExpertiseAndAchievements } from '@/app/(aboutme)/components/expertise';
import { ContactMe } from '@/app/(aboutme)/components/contactme';
import { MyStory } from '@/app/(aboutme)/components/mystory';
import { Services } from '@/app/(aboutme)/components/services';
import { Section } from '@/app/(aboutme)/components/section';

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="space-y-16">
        <Section id="hero">
          <Hero />
        </Section>
        <Section id="services">
          <Services />
        </Section>
        <Section id="expertise">
          <ExpertiseAndAchievements />
        </Section>
        <Section id="story">
          <MyStory />
        </Section>
        <Section id="contact">
          <ContactMe />
        </Section>
      </div>
    </div>
  );
}
