/**
 * Unit tests for Section Reveal System
 * 
 * Tests the Intersection Observer implementation for section reveals.
 * Validates: Requirements 7.1, 7.2
 * 
 * @jest-environment jsdom
 */

import { initializeSectionReveals } from '../sectionReveal';

describe('Section Reveal System', () => {
  let mockIntersectionObserver: jest.Mock;
  let observerCallback: IntersectionObserverCallback;
  let observerOptions: IntersectionObserverInit | undefined;

  beforeEach(() => {
    // Mock IntersectionObserver
    mockIntersectionObserver = jest.fn((callback, options) => {
      observerCallback = callback;
      observerOptions = options;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    global.IntersectionObserver = mockIntersectionObserver as any;

    // Mock document.querySelectorAll
    document.querySelectorAll = jest.fn(() => {
      const mockSection = document.createElement('section');
      return [mockSection] as any;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create IntersectionObserver with correct threshold', () => {
      initializeSectionReveals();

      expect(mockIntersectionObserver).toHaveBeenCalled();
      expect(observerOptions?.threshold).toBe(0.2);
    });

    it('should create IntersectionObserver with correct rootMargin', () => {
      initializeSectionReveals();

      expect(mockIntersectionObserver).toHaveBeenCalled();
      expect(observerOptions?.rootMargin).toBe('0px 0px -100px 0px');
    });

    it('should observe all section elements', () => {
      const mockSections = [
        document.createElement('section'),
        document.createElement('section'),
        document.createElement('section'),
      ];

      document.querySelectorAll = jest.fn(() => mockSections as any);

      const observeMethod = jest.fn();
      mockIntersectionObserver = jest.fn((callback, options) => {
        observerCallback = callback;
        observerOptions = options;
        return {
          observe: observeMethod,
          unobserve: jest.fn(),
          disconnect: jest.fn(),
        };
      });
      global.IntersectionObserver = mockIntersectionObserver as any;

      initializeSectionReveals();

      expect(document.querySelectorAll).toHaveBeenCalledWith('section');
      expect(observeMethod).toHaveBeenCalledTimes(3);
      mockSections.forEach(section => {
        expect(observeMethod).toHaveBeenCalledWith(section);
      });
    });

    it('should return cleanup function', () => {
      const cleanup = initializeSectionReveals();

      expect(cleanup).toBeDefined();
      expect(typeof cleanup).toBe('function');
    });

    it('should not throw error when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => initializeSectionReveals()).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('Class Toggle Logic', () => {
    it('should add section-revealed class when section enters viewport', () => {
      const mockSection = document.createElement('section');
      document.querySelectorAll = jest.fn(() => [mockSection] as any);

      initializeSectionReveals();

      // Simulate intersection
      const mockEntry: Partial<IntersectionObserverEntry> = {
        isIntersecting: true,
        target: mockSection,
      };

      observerCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver);

      expect(mockSection.classList.contains('section-revealed')).toBe(true);
    });

    it('should not add class when section is not intersecting', () => {
      const mockSection = document.createElement('section');
      document.querySelectorAll = jest.fn(() => [mockSection] as any);

      initializeSectionReveals();

      // Simulate non-intersection
      const mockEntry: Partial<IntersectionObserverEntry> = {
        isIntersecting: false,
        target: mockSection,
      };

      observerCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver);

      expect(mockSection.classList.contains('section-revealed')).toBe(false);
    });

    it('should handle multiple sections entering viewport', () => {
      const mockSections = [
        document.createElement('section'),
        document.createElement('section'),
        document.createElement('section'),
      ];
      document.querySelectorAll = jest.fn(() => mockSections as any);

      initializeSectionReveals();

      // Simulate multiple intersections
      const mockEntries: Partial<IntersectionObserverEntry>[] = mockSections.map(section => ({
        isIntersecting: true,
        target: section,
      }));

      observerCallback(mockEntries as IntersectionObserverEntry[], {} as IntersectionObserver);

      mockSections.forEach(section => {
        expect(section.classList.contains('section-revealed')).toBe(true);
      });
    });
  });

  describe('Cleanup', () => {
    it('should unobserve all sections when cleanup is called', () => {
      const mockSections = [
        document.createElement('section'),
        document.createElement('section'),
      ];
      document.querySelectorAll = jest.fn(() => mockSections as any);

      const unobserveMethod = jest.fn();
      mockIntersectionObserver = jest.fn((callback, options) => {
        observerCallback = callback;
        observerOptions = options;
        return {
          observe: jest.fn(),
          unobserve: unobserveMethod,
          disconnect: jest.fn(),
        };
      });
      global.IntersectionObserver = mockIntersectionObserver as any;

      const cleanup = initializeSectionReveals();
      cleanup?.();

      expect(unobserveMethod).toHaveBeenCalledTimes(2);
      mockSections.forEach(section => {
        expect(unobserveMethod).toHaveBeenCalledWith(section);
      });
    });
  });
});
