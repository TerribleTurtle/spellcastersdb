import { Team } from "@/types/deck";

export const TeamPersistenceHelper = {
  /**
   * Updates the Saved Teams list with a new or updated team.
   */
  updateSavedTeams(savedTeams: Team[], newTeam: Team): Team[] {
    const existingIndex = savedTeams.findIndex((t) => t.id === newTeam.id);
    const newSavedTeams = [...savedTeams];

    if (existingIndex >= 0) {
      newSavedTeams[existingIndex] = newTeam;
    } else {
      newSavedTeams.push(newTeam);
    }
    return newSavedTeams;
  },
};
