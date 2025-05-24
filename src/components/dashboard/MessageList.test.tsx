import React from 'react';
import * as TestingLibrary from '@testing-library/react'; // Changed import
import '@testing-library/jest-dom';
import MessageList from './MessageList';
import { MessageWithReactions, Reaction } from '../../types'; // Adjust path if necessary

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
}));

const mockMessages: MessageWithReactions[] = [
  {
    id: '1',
    senderId: 'user1', // Renamed userId to senderId
    content: 'Hello World',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareableLink: 'http://example.com/share/1', // Added shareableLink
    hasPasscode: false,
    reactions: [
      { id: 'r1', messageId: '1', videoUrl: 'http://example.com/video1.mp4', thumbnailUrl: 'http://example.com/thumb1.jpg', duration: 5000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      // This "like" reaction now needs to conform to Reaction type
      { id: 'r2', messageId: '1', videoUrl: '', duration: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, 
    ] as Reaction[],
  },
  {
    id: '2',
    senderId: 'user1', // Renamed userId to senderId
    content: 'Second Message',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareableLink: 'http://example.com/share/2', // Added shareableLink
    hasPasscode: false,
    reactions: [
      // Reaction with videoUrl but no thumbnailUrl
      { id: 'r3', messageId: '2', videoUrl: 'http://example.com/video2.mp4', duration: 6000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ] as Reaction[],
  },
  {
    id: '3',
    senderId: 'user1', // Renamed userId to senderId
    content: 'Third Message, one non-video reaction', // Will have 1 reaction that doesn't display thumbnail
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareableLink: 'http://example.com/share/3', // Added shareableLink
    hasPasscode: false,
    reactions: [
      { id: 'r4', messageId: '3', videoUrl: '', duration: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ] as Reaction[],
  },
  {
    id: '4',
    senderId: 'user1', // Renamed userId to senderId
    content: 'Fourth Message, zero reactions',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareableLink: 'http://example.com/share/4', // Added shareableLink
    hasPasscode: false,
    reactions: [] as Reaction[],
  },
  {
    id: '5',
    senderId: 'user1', // Renamed userId to senderId
    content: 'Fifth Message, null reactions',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareableLink: 'http://example.com/share/5', // Added shareableLink
    hasPasscode: false,
    reactions: null as any, // Intentionally null
  },
  {
    id: '6',
    senderId: 'user1', // Renamed userId to senderId
    content: 'Sixth Message, undefined reactions',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareableLink: 'http://example.com/share/6', // Added shareableLink
    hasPasscode: false,
    reactions: undefined as any, // Intentionally undefined
  },
];

// Access screen and render via TestingLibrary.screen and TestingLibrary.render
const { render, screen } = TestingLibrary;

describe('MessageList Component', () => {
  describe('Reaction Count Display', () => {
    it('displays the correct reaction count for multiple reactions', () => {
      render(<MessageList messages={[mockMessages[0]]} />);
      // Message 1 has 2 reactions
      expect(screen.getByText('2 reactions')).toBeInTheDocument();
    });

    it('displays the correct reaction count for a single reaction', () => {
      render(<MessageList messages={[mockMessages[1]]} />);
      // Message 2 has 1 reaction
      expect(screen.getByText('1 reaction')).toBeInTheDocument();
    });
    
    it('displays the correct reaction count for a single non-video reaction', () => {
      render(<MessageList messages={[mockMessages[2]]} />);
      // Message 3 has 1 reaction (non-video)
      expect(screen.getByText('1 reaction')).toBeInTheDocument();
    });

    it('does not display the reaction section if there are zero reactions', () => {
      render(<MessageList messages={[mockMessages[3]]} />);
      // Message 4 has 0 reactions
      // The "Reactions" heading or count should not be present.
      // The text "Reactions" itself is a heading, so we query for that.
      expect(screen.queryByText('Reactions', { selector: 'h4' })).not.toBeInTheDocument();
      expect(screen.queryByText(/reactions?$/i, { selector: 'p' })).not.toBeInTheDocument(); // Check for "1 reaction" or "X reactions"
    });

    it('handles null reactions gracefully', () => {
      render(<MessageList messages={[mockMessages[4]]} />);
      // Message 5 has null reactions
      expect(screen.queryByText('Reactions', { selector: 'h4' })).not.toBeInTheDocument();
      expect(screen.queryByText(/reactions?$/i, { selector: 'p' })).not.toBeInTheDocument();
    });

    it('handles undefined reactions gracefully', () => {
      render(<MessageList messages={[mockMessages[5]]} />);
      // Message 6 has undefined reactions
      expect(screen.queryByText('Reactions', { selector: 'h4' })).not.toBeInTheDocument();
      expect(screen.queryByText(/reactions?$/i, { selector: 'p' })).not.toBeInTheDocument();
    });
  });

  describe('Video Reaction Thumbnail Display', () => {
    it('displays an img thumbnail when a reaction has videoUrl and thumbnailUrl', () => {
      render(<MessageList messages={[mockMessages[0]]} />); // Message 1 has such a reaction
      const images = screen.getAllByRole('img') as HTMLImageElement[];
      // Find the specific thumbnail by src or alt text. Here, we assume it's the only image in this context for simplicity or add specific alt.
      // Let's assume the alt text for reaction thumbnails is "Reaction thumbnail"
      const reactionThumbnail = images.find((img: HTMLImageElement) => img.getAttribute('alt') === 'Reaction thumbnail');
      expect(reactionThumbnail).toBeInTheDocument();
      expect(reactionThumbnail).toHaveAttribute('src', 'http://example.com/thumb1.jpg');
    });

    it('displays an SVG placeholder when a reaction has videoUrl but no thumbnailUrl', () => {
      render(<MessageList messages={[mockMessages[1]]} />); // Message 2 has this case
      // Check for the presence of an SVG element within the reaction thumbnail area.
      // This requires specific knowledge of the SVG structure or a test ID on the SVG.
      // For now, let's check if there's no img, but the "Reactions" section for video is there.
      const reactionSection = screen.getByText('1 reaction').closest('.mt-4'); // The parent div of reactions section
      expect(reactionSection).toBeInTheDocument();

      const images = screen.queryAllByRole('img', { name: /Reaction thumbnail/i });
      expect(images.length).toBe(0); // No actual image thumbnail

      // To check for SVG: The SVG has <path d="M14.752 11.168l-3.197-2.132...
      // This is a bit brittle. A data-testid on the SVG placeholder would be better.
      const svgs = reactionSection!.querySelectorAll('svg') as NodeListOf<SVGSVGElement>;
      let foundPlaceholder = false;
      svgs.forEach((svg: SVGSVGElement) => {
        if (svg.innerHTML.includes('M14.752')) { // A unique part of the placeholder SVG's path
          foundPlaceholder = true;
        }
      });
      expect(foundPlaceholder).toBe(true);
    });

    it('does not display video thumbnails or placeholders if reactions have no videoUrl', () => {
      render(<MessageList messages={[mockMessages[2]]} />); // Message 3 has a 'like' reaction, no video
      // The reaction count "1 reaction" should be there.
      expect(screen.getByText('1 reaction')).toBeInTheDocument();
      // But the div that hosts thumbnails (mt-2 flex space-x-2...) should not be.
      // Let's find the "Reactions" heading
      const reactionsHeading = screen.getByText('Reactions', { selector: 'h4' });
      const reactionSectionDiv = reactionsHeading.closest('div.mt-4');
      expect(reactionSectionDiv).toBeInTheDocument();
      // Check if the specific div for thumbnails is missing
      expect(reactionSectionDiv!.querySelector('.mt-2.flex.space-x-2')).not.toBeInTheDocument();
    });

    it('does not display video thumbnails or placeholders if there are no reactions at all', () => {
      render(<MessageList messages={[mockMessages[3]]} />); // Message 4 has no reactions
      expect(screen.queryByRole('img', { name: /Reaction thumbnail/i })).not.toBeInTheDocument();
      // Also check for placeholder SVG, more robustly if possible (e.g. data-testid)
      // For now, check the entire reaction section isn't there.
      expect(screen.queryByText('Reactions', { selector: 'h4' })).not.toBeInTheDocument();
    });
  });
});

// A helper to define types for MessageWithReactions and Reaction if not already globally available
// For the purpose of this test file, if `../../types` is not correct, adjust as needed.
// Example:
// declare module '../../types' {
//   export interface Reaction {
//     id: string;
//     messageId: string;
//     userId: string;
//     type: string;
//     videoUrl?: string;
//     thumbnailUrl?: string;
//     createdAt: string;
//   }
//   export interface MessageWithReactions {
//     id: string;
//     userId: string;
//     content: string;
//     createdAt: string;
//     updatedAt: string;
//     views: number;
//     hasPasscode: boolean;
//     reactions: Reaction[] | null | undefined;
//   }
// }
