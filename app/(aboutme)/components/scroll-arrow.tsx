import { MoveDown } from 'lucide-react';
import { useSection } from './sectioncontext';

const sectionOrder = ['hero', 'services', 'expertise', 'story', 'contact'];

export function ScrollArrow() {
  const { currentSection, scrollToSection } = useSection();

  const handleClick = () => {
    const currentIndex = sectionOrder.indexOf(currentSection);
    const nextSection = sectionOrder[currentIndex + 1];
    if (nextSection) {
      scrollToSection(nextSection);
    }
  };

  // Don't show the arrow on the last section
  if (currentSection === sectionOrder[sectionOrder.length - 1]) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="animate-bounce p-2 rounded-full transition-colors"
      aria-label="Scroll to next section"
    >
      <MoveDown className="w-6 h-6 text-foreground" />
    </button>
  );
}
