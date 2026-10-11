import { AiInstitutionalToolsService } from './ai-institutional-tools.service';

describe('Navigation Module Labels & Catalog Integrity', () => {
  let toolsService: AiInstitutionalToolsService;

  beforeEach(() => {
    // Instantiate with dummy dependencies since moduleCatalog is static
    toolsService = new AiInstitutionalToolsService(
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
    );
  });

  it('should contain all 28 canonical operational modules', () => {
    expect(toolsService.moduleCatalog).toBeDefined();
    expect(toolsService.moduleCatalog.length).toBe(28);
  });

  it('should have clean names with zero unwanted leading numeric prefixes across all modules', () => {
    const numericPrefixRegex = /^\d+[.\s-]/;
    
    toolsService.moduleCatalog.forEach((mod) => {
      expect(mod.name).not.toMatch(numericPrefixRegex);
      expect(typeof mod.name).toBe('string');
      expect(mod.name.trim().length).toBeGreaterThan(0);
    });
  });

  it('should preserve internal codes and IDs without modifying names', () => {
    const patientsMod = toolsService.moduleCatalog.find((m) => m.id === 'patients');
    expect(patientsMod).toBeDefined();
    expect(patientsMod?.code).toBe('01');
    expect(patientsMod?.name).toBe('Patient Registry');

    const dashboardMod = toolsService.moduleCatalog.find((m) => m.id === 'dashboard');
    expect(dashboardMod).toBeDefined();
    expect(dashboardMod?.code).toBe('22');
    expect(dashboardMod?.name).toBe('Management Dashboard');

    const detoxMod = toolsService.moduleCatalog.find((m) => m.id === 'detox');
    expect(detoxMod).toBeDefined();
    expect(detoxMod?.name).toBe('Detox (CIWA/COWS & Vitals)');
  });

  it('should have unique IDs across all 28 modules', () => {
    const ids = toolsService.moduleCatalog.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(28);
  });
});
