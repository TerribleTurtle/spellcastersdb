
import { describe, it, expect } from 'vitest';
import { TeamPersistenceHelper } from '../TeamPersistenceHelper';
import { Team } from '@/types/deck';
import { TeamFactory } from '../TeamFactory';

describe('TeamPersistenceHelper', () => {
    it('should add new team if ID not found', () => {
        const savedTeams: Team[] = [];
        const newTeam = TeamFactory.constructTeam("t1", "New", TeamFactory.createInitialTeamDecks(), null);
        
        const result = TeamPersistenceHelper.updateSavedTeams(savedTeams, newTeam);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(newTeam);
    });

    it('should update existing team if ID matches', () => {
        const deck1 = TeamFactory.createInitialTeamDecks();
        const team1 = TeamFactory.constructTeam("t1", "Old Name", deck1, null);
        const savedTeams = [team1];
        
        const updatedTeam = { ...team1, name: "New Name" };
        const result = TeamPersistenceHelper.updateSavedTeams(savedTeams, updatedTeam);
        
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("New Name");
    });
});
