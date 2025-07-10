import { Request, Response } from 'express';
import { MailjetService } from '../../../application/services/mailjet-service.js';

export class NewsletterController {
  private mailjetService: MailjetService;

  constructor() {
    this.mailjetService = new MailjetService();
  }

  subscribe = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name, country } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      const result = await this.mailjetService.addEmailToContactList(email, name, country);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}
