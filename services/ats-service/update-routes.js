const fs = require('fs');

const path = 'g:/code/splits.network/services/ats-service/src/v2/routes.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { SavedJobRepositoryV2 }')) {
    code = code.replace(
        "import { savedJobRoutes } from './saved-jobs/routes';",
        "import { savedJobRoutes } from './saved-jobs/routes';\nimport { SavedJobRepositoryV2 } from './saved-jobs/repository';\nimport { SavedJobServiceV2 } from './saved-jobs/service';"
    );
}

if (!code.includes('const savedJobRepository = new SavedJobRepositoryV2')) {
    code = code.replace(
        "const applicationService = new ApplicationServiceV2(",
        "const savedJobRepository = new SavedJobRepositoryV2(jobRepository.getSupabase());\n    const savedJobService = new SavedJobServiceV2(savedJobRepository, config.eventPublisher as any, jobRepository.getSupabase());\n\n    const applicationService = new ApplicationServiceV2("
    );
}

if (code.includes("app.register(savedJobRoutes, { prefix: '/saved-jobs' });")) {
    code = code.replace(
        "app.register(savedJobRoutes, { prefix: '/saved-jobs' });",
        "savedJobRoutes(app, { service: savedJobService, repository: savedJobRepository });"
    );
}

fs.writeFileSync(path, code);
