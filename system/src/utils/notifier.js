import AWS from 'aws-sdk';
import axios from 'axios';

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,	
	region: process.env.AWS_REGION
});

class NotificationService {
    
	constructor() {
		this.ses = new AWS.SES({ apiVersion: '2010-12-01' });
		this.sns = new AWS.SNS();
	}

	// Internal method to send email
	async sendFinalEmail(body, senderEmails) {  console.log(body);
		try {
			const parameters = {
				Destination: { ToAddresses: senderEmails },
				Message: {
					Body: {},
					Subject: { Charset: 'UTF-8', Data: body.subject || "No Subject" },
				},
				Source: process.env.SES_SOURCE_EMAIL_ID || "info@pharmarack.com",
			};
	
			if (body.htmlData) {
				parameters.Message.Body.Html = {
					Charset: 'UTF-8',
					Data: body.htmlData
				};
			} else if (body.data) {
				parameters.Message.Body.Text = {
					Charset: 'UTF-8',
					Data: body.data
				};
			} else {
				throw new Error("Email body is missing. Provide 'htmlData' or 'data' in the body.");
			}
	
			await this.ses.sendEmail(parameters).promise();
		} catch (error) {
			console.error(error);
			throw new Error('Failed to send email');
		}
	}

	// Public method to send email
	async sendEmail(body) {
		try {
			if (!body?.multiple) {
				const atPos = body.toEmailId?.indexOf('@') ?? -1;
				const dotPos = body.toEmailId?.lastIndexOf('.') ?? -1;

				if (body.toEmailId && atPos > 0 && dotPos > atPos + 1 && dotPos < body.toEmailId.length - 1) {
					await this.sendFinalEmail(body, [body.toEmailId]);
				} else {
					throw new Error('Invalid email id', body.toEmailId);
				}
			} else {
				await this.sendFinalEmail(body, body.toEmailId);
			}
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	// Primary SMS provider
	async sendSmsPrimary(body) {
		const parameters = {
			username: `${process.env.MSG_CLIENT_USERNAME}`,
			password: `${process.env.MSG_CLIENT_PASSWORD}`,
			senderid: `${process.env.MSG_SENDER_ID}`,
			message: encodeURIComponent(`${body.message}`),
			numbers: `${body.mobile}`,
			dndrefund: 1
		};

		const headers = {
			Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
			'Accept-Language': 'en-US,en;q=0.9',
			Connection: 'keep-alive',
			Cookie: 'session_cookie=a4eec8c03d20bf72632dcb6d13d541f5d076a3dba4c77e387cc2d39ae6bebc2d',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'
		};

		try {
			const response = await axios({
				method: 'GET',
				url: 'http://smsapi.ishtehar.org/api/sendsms',
				headers: headers,
				params: parameters
			});

			return response.data;
		} catch (error) {
			console.error('Failed to send SMS through primary provider', error);
			throw error;
		}
	}

	// Fallback SMS provider
	async sendSmsSecondary(body) {
		const regex = /^[6-9]\d{9}$/;

		try {
			if (body.mobile && regex.test(body.mobile.substring(3))) {
				const parameters = {
					Message: body.message,
					PhoneNumber: body.mobile,
					MessageStructure: 'string',
					MessageAttributes: {
						'AWS.SNS.SMS.SMSType': {
							DataType: 'String', StringValue: 'Transactional'
						},
						'AWS.SNS.SMS.SenderID': {
							DataType: 'String', StringValue: process.env.MSG_SENDER_ID
						},
						'AWS.MM.SMS.EntityId': {
							DataType: 'String', StringValue: process.env.ENTITY_ID
						},
						'AWS.MM.SMS.TemplateId': {
							DataType: 'String', StringValue: body.templateId
						}
					}
				};

				const result = await this.sns.publish(parameters).promise();
				return result;
			} else {
				throw new Error('Mobile number not valid', body.mobile);
			}
		} catch (error) {
			console.error('Failed to send SMS through secondary provider', error);
			throw error;
		}
	}

	// Method to handle sending SMS with fallback
	async sendSms(body) {
		try {
			return await this.sendSmsPrimary(body);
		} catch (primaryError) {
			try {
				return await this.sendSmsSecondary(body);
			} catch (secondaryError) {
				console.error('Both primary and secondary SMS providers failed', secondaryError);
				throw secondaryError;
			}
		}
	}
}

export default NotificationService;