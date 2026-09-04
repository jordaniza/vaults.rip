type SkillEntry = {
  body?: string;
  data: {
    name: string;
    description: string;
  };
};

export function renderSkill(entry: SkillEntry) {
  if (!entry.body) return;

  return [
    "---",
    `name: ${entry.data.name}`,
    `description: ${JSON.stringify(entry.data.description)}`,
    "---",
    "",
    entry.body.trim(),
  ].join("\n");
}

