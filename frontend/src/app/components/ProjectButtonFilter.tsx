import { FilterType } from './ProjectGrid';

interface ProjectFilterButtonProps {
  filter: FilterType;
  activeFilter: string;
  onClick: (filter: FilterType) => void;
}

export default function ProjectFilterButton({ filter, activeFilter, onClick }: ProjectFilterButtonProps) {
  return (
    <button 
      onClick={() => onClick(filter)}
      className={`text-left transition-colors filter-button ${
        activeFilter === filter ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
    >
      {filter.charAt(0).toUpperCase() + filter.slice(1)}
    </button>
  );
}