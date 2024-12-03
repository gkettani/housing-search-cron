import { Database } from './database';
import logger from './logger';
import {
	CompositeNotificationService,
	DiscordNotificationStrategy,
	EmailNotificationStrategy,
	SlackNotificationStrategy,
} from './notification';
import { CompositeScraperService, FacHabitatScraperStrategy } from './scraper';
import { ScrapingOrchestrator } from './scrapingOrchestrator';

export default {
	async scheduled(_event, env, _ctx): Promise<void> {

		const database = new Database(env.DB);

		const compositeScraper = new CompositeScraperService().addStrategy(
			new FacHabitatScraperStrategy(),
		);

		const notificationService = new CompositeNotificationService()
			.addStrategy(
				new EmailNotificationStrategy({
					EMAIL_FROM: env.RESEND_EMAIL_FROM,
					EMAIL_TO: env.RESEND_EMAIL_TO,
					RESEND_API_KEY: env.RESEND_KEY,
				}),
			)
			.addStrategy(new SlackNotificationStrategy('', false))
			.addStrategy(new DiscordNotificationStrategy('', false));

		const orchestrator = new ScrapingOrchestrator(
			database,
			compositeScraper,
			notificationService,
		);

		try {
			await orchestrator.run();
		} catch (error) {
			logger.error(error);
		}
	},
} satisfies ExportedHandler<Env>;
