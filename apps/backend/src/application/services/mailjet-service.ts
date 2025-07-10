import mailjet from 'node-mailjet';

type MailjetClient = ReturnType<typeof mailjet.apiConnect>;

export class MailjetService {
  private client: MailjetClient;
  private contactListId: number;
  private countryPropertyCreated: boolean = false;

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

  private async ensureCountryPropertyExists(): Promise<void> {
    if (this.countryPropertyCreated) {
      return;
    }

    try {
      // Check if the country property already exists
      const existingPropertiesResponse = await this.client.get('contactmetadata').request();
      const existingProperties = (
        existingPropertiesResponse.body as { Data: Array<{ Name: string }> }
      ).Data;

      const countryPropertyExists = existingProperties.some(prop => prop.Name === 'country');

      if (!countryPropertyExists) {
        // Create the country property
        await this.client.post('contactmetadata').request({
          Name: 'country',
          Datatype: 'str',
          NameSpace: 'static'
        });
      }

      this.countryPropertyCreated = true;
    } catch (error) {
      console.warn('Failed to ensure country property exists:', error);
      // Continue anyway - the property might already exist
      this.countryPropertyCreated = true;
    }
  }

  async addEmailToContactList(
    email: string,
    name?: string,
    country?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Ensure the country property exists if we need to use it
      if (country) {
        await this.ensureCountryPropertyExists();
      }

      // First, create or get the contact
      const contactResponse = await this.client.post('contact').request({
        Email: email,
        Name: name || ''
      });

      const contactData = (contactResponse.body as { Data: Array<{ ID: number }> }).Data[0];
      const contactId = contactData.ID;

      // Add contact properties if provided
      if (country) {
        try {
          await this.client
            .put('contactdata')
            .id(contactId)
            .request({
              Data: [
                {
                  Name: 'country',
                  Value: country
                }
              ]
            });
        } catch (propertyError) {
          console.warn(
            'Failed to update contact properties, but contact was created:',
            propertyError
          );
          // Continue with adding to list even if properties fail
        }
      }

      // Then add the contact to the list
      await this.client
        .post('contactslist')
        .id(this.contactListId)
        .action('managecontact')
        .request({
          Email: email,
          Action: 'addnoforce'
        });

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
