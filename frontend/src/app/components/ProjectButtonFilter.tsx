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
      className={`text-left transition-colors w-fit ${
        activeFilter === filter ? 'button-selected' : ''
      }`}
    >
      {filter.charAt(0).toUpperCase() + filter.slice(1)}
    </button>
  );
}