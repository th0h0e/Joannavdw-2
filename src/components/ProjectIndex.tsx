type ProjectIndexProps = {
  projectTitles: string[];
};

export default function ProjectIndex({ projectTitles }: ProjectIndexProps) {

  return (
    <section className="h-screen w-screen snap-start bg-white flex items-center justify-center">
      <div className="w-4/5 text-center">
        <ul className="space-y-4">
          {projectTitles.map((title, index) => (
            <li key={index}>
              <a 
                href={`#project-${index}`}
                className="text-black text-2xl md:text-3xl lg:text-4xl xl:text-5xl uppercase leading-tight hover:opacity-70 transition-opacity duration-300 block"
                style={{ 
                  fontFamily: 'EnduroWeb, sans-serif',
                  letterSpacing: '0.03em',
                  textDecoration: 'none'
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