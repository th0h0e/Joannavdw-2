import { projectTitleClasses, projectTitleStyle } from '../utils/sharedStyles';

type ProjectIndexProps = {
  projectTitles: string[];
};

export default function ProjectIndex({ projectTitles }: ProjectIndexProps) {

  return (
    <section id="project-index" className="h-screen w-full snap-start bg-white flex items-center justify-center">
      <div className="w-full md:w-4/5 text-center px-6 md:px-0">
        <ul className="space-y-1">
          {projectTitles.map((title, index) => (
            <li key={index}>
              <a 
                href={`#project-${index}`}
                className={`text-black ${projectTitleClasses} no-underline hover:underline transition-all duration-200`}
                style={{ 
                  ...projectTitleStyle
                }}
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}