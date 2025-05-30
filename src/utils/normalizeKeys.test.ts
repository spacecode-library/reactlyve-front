import { normalizeMessage } from './normalizeKeys'; // Assuming the path

describe('normalizeMessage', () => {
  it('should return the message as is if it is null or undefined', () => {
    expect(normalizeMessage(null)).toBeNull();
    expect(normalizeMessage(undefined)).toBeUndefined();
  });

  it('should correctly map reaction_length when present', () => {
    const message = { content: 'test', reaction_length: 20 };
    const normalized = normalizeMessage(message);
    expect(normalized.reaction_length).toBe(20);
    expect(normalized.content).toBe('test'); // Ensure other props are passed
  });

  it('should correctly map reactionLength (camelCase) to reaction_length if snake_case is not present', () => {
    const message = { content: 'test', reactionLength: 25 };
    const normalized = normalizeMessage(message);
    expect(normalized.reaction_length).toBe(25);
  });

  it('should prioritize reaction_length (snake_case) if both snake_case and camelCase (reactionLength) are present', () => {
    const message = { content: 'test', reaction_length: 15, reactionLength: 25 };
    const normalized = normalizeMessage(message);
    // The logic `message.reaction_length ?? message.reactionLength` means reaction_length (if not null/undefined) is used.
    expect(normalized.reaction_length).toBe(15);
  });

  it('should handle message where reaction_length is explicitly null and reactionLength is present', () => {
    const message = { content: 'test', reaction_length: null, reactionLength: 22 };
    const normalized = normalizeMessage(message);
    // `null ?? anything` results in `anything`
    expect(normalized.reaction_length).toBe(22);
  });

  it('should handle message where reaction_length is explicitly undefined and reactionLength is present', () => {
    const message = { content: 'test', reaction_length: undefined, reactionLength: 23 };
    const normalized = normalizeMessage(message);
    // `undefined ?? anything` results in `anything`
    expect(normalized.reaction_length).toBe(23);
  });

  it('should result in undefined reaction_length if neither snake_case nor camelCase are present', () => {
    const message = { content: 'test only' };
    const normalized = normalizeMessage(message);
    expect(normalized.reaction_length).toBeUndefined();
  });

  it('should pass through other properties correctly', () => {
    const message = {
      id: 'msg1',
      content: 'Hello',
      imageUrl: 'image.png',
      mediaType: 'image',
      createdAt: '2024-01-01T00:00:00Z',
      reaction_length: 10,
    };
    const normalized = normalizeMessage(message);
    expect(normalized.id).toBe('msg1');
    expect(normalized.content).toBe('Hello');
    expect(normalized.imageUrl).toBe('image.png');
    expect(normalized.mediaType).toBe('image');
    expect(normalized.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(normalized.reaction_length).toBe(10);
  });

  // Test case for existing logic: imageUrl vs imageurl (example)
  it('should normalize imageUrl from imageurl if imageUrl is not present', () => {
    const message = { content: 'test', imageurl: 'test.jpg' };
    const normalized = normalizeMessage(message);
    expect(normalized.imageUrl).toBe('test.jpg');
  });

  it('should prioritize imageUrl over imageurl if both are present', () => {
    const message = { content: 'test', imageUrl: 'priority.jpg', imageurl: 'secondary.jpg' };
    const normalized = normalizeMessage(message);
    expect(normalized.imageUrl).toBe('priority.jpg');
  });
});
