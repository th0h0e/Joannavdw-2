import ProjectNavigation from './ProjectNavigation';

type ProjectIndexProps = {
  projectTitles: string[];
};

export default function ProjectIndex({ projectTitles }: ProjectIndexProps) {
  return (
    <section id="project-index" className="h-dvh w-full snap-center bg-white flex items-center justify-center">
      <ProjectNavigation projectTitles={projectTitles} />
    </section>
  );
}