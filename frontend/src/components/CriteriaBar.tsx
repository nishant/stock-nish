interface CriteriaBarProps {
  criteria: string;
}

export function CriteriaBar({ criteria }: CriteriaBarProps): JSX.Element {
  return (
    <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 px-4 py-3 text-sm text-blue-300">
      <span className="mr-2 font-semibold text-blue-400">Screening criteria:</span>
      {criteria}
    </div>
  );
}
