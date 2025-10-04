import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Syncer } from '../../src/core/syncer';
import { FileUtils } from '../../src/utils/file-utils';
import { Logger } from '../../src/utils/logger';

vi.mock('../../src/utils/file-utils');
vi.mock('../../src/utils/logger');

describe('Syncer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createExample', () => {
        it('should create .env.example file when it does not exist', () => {
            vi.mocked(FileUtils.exists).mockReturnValue(false);

            Syncer.createExample();

            expect(FileUtils.exists).toHaveBeenCalledWith('.env.example');
            expect(FileUtils.write).toHaveBeenCalledWith(
                '.env.example',
                expect.stringContaining('# Environment Variables')
            );
            expect(Logger.success).toHaveBeenCalledWith('Created .env.example');
        });

        it('should create .env.example with correct content structure', () => {
            vi.mocked(FileUtils.exists).mockReturnValue(false);

            Syncer.createExample();

            const expectedContent = `# Environment Variables
# Add your environment variables here
`;

            expect(FileUtils.write).toHaveBeenCalledWith('.env.example', expectedContent);
        });

        it('should log warning and not create file when .env.example already exists', () => {
            vi.mocked(FileUtils.exists).mockReturnValue(true);

            Syncer.createExample();

            expect(FileUtils.exists).toHaveBeenCalledWith('.env.example');
            expect(Logger.warning).toHaveBeenCalledWith('.env.example already exists');
            expect(FileUtils.write).not.toHaveBeenCalled();
            expect(Logger.success).not.toHaveBeenCalled();
        });

        it('should return early when file exists', () => {
            vi.mocked(FileUtils.exists).mockReturnValue(true);

            Syncer.createExample();

            // Vérifier que seul exists et warning ont été appelés
            expect(FileUtils.exists).toHaveBeenCalledTimes(1);
            expect(Logger.warning).toHaveBeenCalledTimes(1);
            expect(FileUtils.write).toHaveBeenCalledTimes(0);
        });

        it('should call FileUtils and Logger in correct order when creating file', () => {
            vi.mocked(FileUtils.exists).mockReturnValue(false);
            const callOrder: string[] = [];

            vi.mocked(FileUtils.exists).mockImplementation(() => {
                callOrder.push('exists');
                return false;
            });

            vi.mocked(FileUtils.write).mockImplementation(() => {
                callOrder.push('write');
            });

            vi.mocked(Logger.success).mockImplementation(() => {
                callOrder.push('success');
            });

            Syncer.createExample();

            expect(callOrder).toEqual(['exists', 'write', 'success']);
        });
    });
});
