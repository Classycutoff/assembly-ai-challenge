import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Github, Linkedin, Mail } from 'lucide-react';
import aboutData from '../data/about.json';

const About = () => {
  const challengeHtml = aboutData.description.challenge.replace(
    'here</a>',
    'here</a></span>'
  ).replace(
    '<a ',
    '<span class="challenge-link"><a '
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">{aboutData.title}</h1>
      
      <Card className="bg-[hsl(var(--header))] text-[hsl(var(--header-foreground))]">
        <CardHeader>
          <CardTitle className="text-2xl">Contact</CardTitle>
        </CardHeader>
        <CardContent className="text-lg">
          <h2 className="text-xl font-semibold mb-2">{aboutData.contact.name}</h2>
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="h-5 w-5" />
            <a href={`mailto:${aboutData.contact.email}`} className="hover:underline">{aboutData.contact.email}</a>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <Github className="h-5 w-5" />
            <a href={aboutData.contact.github} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          </div>
          <div className="flex items-center space-x-2">
            <Linkedin className="h-5 w-5" />
            <a href={aboutData.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{aboutData.description.main}</p>
          <div className="mb-4" dangerouslySetInnerHTML={{ __html: challengeHtml }} />
          <h3 className="text-lg font-semibold mb-2">Features:</h3>
          <ul className="list-disc pl-5 space-y-2">
            {aboutData.description.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;