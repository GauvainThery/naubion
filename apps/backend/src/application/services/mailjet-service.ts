import mailjet from 'node-mailjet';

type MailjetClient = ReturnType<typeof mailjet.apiConnect>;

export class MailjetService {
  private client: MailjetClient;
  private contactListId: number;

  constructor() {
    const apiKey = process.env.MAILJET_API_KEY;
    const apiSecret = process.env.MAILJET_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('MailJet API credentials are not configured');
    }

    this.client = mailjet.apiConnect(apiKey, apiSecret);
    this.contactListId = parseInt(process.env.MAILJET_CONTACT_LIST_ID || '0');

    if (!this.contactListId) {
      throw new Error('MailJet contact list ID is not configured');
    }
  }

  async addEmailToContactList(
    email: string,
    name?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // First, create or get the contact
      const contactResponse = await this.client.post('contact').request({
        Email: email,
        Name: name || ''
      });

      console.log(
        'Contact created/retrieved:',
        (contactResponse.body as { Data: unknown[] }).Data[0]
      );

      // Then add the contact to the list
      const addToListResponse = await this.client
        .post('contactslist')
        .id(this.contactListId)
        .action('managecontact')
        .request({
          Email: email,
          Action: 'addnoforce'
        });

      console.log('Contact added to list:', addToListResponse.body);

      return {
        success: true,
        message: 'Email successfully added to contact list'
      };
    } catch (error: unknown) {
      console.error('MailJet error:', error);

      // Handle specific MailJet errors
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 400) {
        const errorResponse = error as { response?: { body?: { ErrorMessage?: string } } };
        const errorMessage = errorResponse.response?.body?.ErrorMessage;

        // If contact already exists in list, that's fine
        if (
          errorMessage &&
          (errorMessage.includes('already exists') || errorMessage.includes('duplicate'))
        ) {
          return {
            success: true,
            message: 'Email is already in the contact list'
          };
        }

        return {
          success: false,
          message: errorMessage || 'Failed to add email to contact list'
        };
      }

      return {
        success: false,
        message: 'Failed to add email to contact list'
      };
    }
  }

  async getContactLists() {
    try {
      const response = await this.client.get('contactslist').request();

      return (response.body as { Data: unknown[] }).Data;
    } catch (error) {
      console.error('Error fetching contact lists:', error);
      throw error;
    }
  }
}
