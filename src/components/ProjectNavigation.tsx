import { navigationContainerClasses, navigationLinkClasses, navigationListClasses, projectTitleStyle } from '../utils/sharedStyles';

type ProjectNavigationProps = {
  projectTitles: string[];
  onLinkClick?: (index: number) => void;
};

export default function ProjectNavigation({ projectTitles, onLinkClick }: ProjectNavigationProps) {
  return (
    <div className={navigationContainerClasses}>
      <ul className={navigationListClasses}>
        {projectTitles.map((title, index) => (
          <li key={index}>
            <a 
              href={`#project-${index}`}
              className={navigationLinkClasses}
              style={projectTitleStyle}
              onClick={(e) => {
                if (onLinkClick) {
                  e.preventDefault();
                  onLinkClick(index);
                } else {
                  // Default behavior for ProjectIndex - direct navigation
                }
              }}
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}