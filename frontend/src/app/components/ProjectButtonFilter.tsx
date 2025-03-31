import { useProjects } from '../context/ProjectsContext';
import { FilterType } from '../context/ProjectsContext';

interface ProjectFilterButtonProps {
  filter: FilterType;
}

export default function ProjectFilterButton({ filter }: ProjectFilterButtonProps) {
  const { activeFilter, setActiveFilter } = useProjects();
  
  return (
    <button 
      onClick={() => setActiveFilter(filter)}
      className={`text-left w-fit ${
        activeFilter === filter ? 'button-selected' : ''
      }`}
    >
      {filter.charAt(0).toUpperCase() + filter.slice(1).replace('nd', ' & D')}
    </button>
  );
}