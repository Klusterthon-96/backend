import nodemailer, { TransportOptions } from "nodemailer";

import { MAILER, APP_NAME } from "./../config";
import CustomError from "../utils/custom-error";

import type { IUser } from "./../models/user.model";

class MailService {
    user: IUser;

    constructor(user: IUser) {
        this.user = user;
    }

    async send(subject: string, content: string, recipient: string) {
        content = content || " ";

        if (!recipient || recipient.length < 1) throw new CustomError("Recipient is required");
        if (!subject) throw new CustomError("Subject is required");

        const transporter = nodemailer.createTransport({
            host: MAILER.HOST,
            port: MAILER.PORT,
            secure: true,
            requireTLS: true,
            auth: {
                user: MAILER.USER,
                pass: MAILER.PASSWORD
            }
        } as TransportOptions);

        const result = await transporter.sendMail({
            from: `${APP_NAME} <${MAILER.USER}>`,
            to: Array.isArray(recipient) ? recipient.join() : recipient,
            subject,
            text: content
        });

        if (!result) throw new CustomError("Unable to send mail");

        return result;
    }
    async welcomeMail() {
        const subject = "Welcome to Agro Assistant - Your AI-Powered Farming Partner";
        const content = `Dear ${this.user.name},\n\nWelcome to Agro Assistant, your one-stop solution for optimizing crop yields, minimizing losses, and embracing sustainable farming practices through the power of artificial intelligence.\nWe're excited to have you join our growing community of farmers who are transforming their operations with Agro Assistant's cutting-edge technology. With our personalized recommendations, data-driven insights, and expert advice, you'll be able to make informed decisions that lead to increased productivity, reduced environmental impact, and enhanced profitability.\nTo get started, simply log in to your Agro Assistant account and explore the various features that await you. You'll find personalized planting and harvesting recommendations, essential crop information,sustainable irrigation practices, proactive pest and disease prevention alerts, and much more.\n\nAs you embark on your journey with Agro Assistant, we're here to support you every step of the way. Our dedicated customer success team is available to answer your questions, provide guidance, and ensure you're making the most of our platform.\n\nThank you for choosing Agro Assistant. Together, let's revolutionize the future of farming.\n\nHappy Farming,\nThe Agro Assistant Team`;
        const recipient = this.user.email;

        return await this.send(subject, content, recipient);
    }
    async sendEmailVerificationMail(link: string) {
        const subject = "Verify Your Agro Assistant Email Address";
        const content = `Dear ${this.user.name},\n\nThank you for signing up for Agro Assistant. To complete your registration and access all the features our platform has to offer, please verify your email address by clicking on the following link:\n\n${link}\n\nThis link will redirect you to a secure page where you can verify your email address. Once verified, you'll be able to start exploring the features that will transform your farming operations.\n\nIf you have any questions or need assistance, please don't hesitate to contact our customer support team.\n\nSincerely,\nThe Agro Assistant Team`;
        const recipient = this.user.email;

        return await this.send(subject, content, recipient);
    }

    async sendSuccessVerificationMail() {
        const subject = "Welcome Chief";
        const content = `Dear ${this.user.name},\n\nThank you for Verifying your Agro Assistant email Address. You can start exploring the features that will transform your farming operations.\n\nIf you have any questions or need assistance, please don't hesitate to contact our customer support team.\n\nSincerely,\nThe Agro Assistant Team`;
        const recipient = this.user.email;

        return await this.send(subject, content, recipient);
    }

    async sendPasswordResetMail(link: string) {
        const subject = "Reset Your Agro Assistant Password";
        const content = `Dear ${this.user.name},\n\nWe've received a request to reset your Agro Assistant password. To proceed with the password reset, please follow this link:\n\n${link}\n\nThis link will redirect you to a secure page where you can set a new password for your Agro Assistant account. Please choose a strong password that is easy to remember but difficult to guess.\n\nIf you didn't initiate a password reset, please disregard this email. Your password will remain unchanged.\n\nSincerely,\nThe Agro Assistant Team`;
        const recipient = this.user.email;

        return await this.send(subject, content, recipient);
    }

    async sendSuccessPasswordReset() {
        const subject = "Your Agro Assistant Password Has Been Updated";
        const content = `Dear ${this.user.name},\n\nYour Agro Assistant password has been successfully updated. You can now log in to your account using your new password.\nPlease keep your password safe and confidential to protect your Agro Assistant account. \nIf you have any further questions or need assistance, please contact our customer support team.\n\nSincerely,\nThe Agro Assistant Team`;
        const recipient = this.user.email;

        return await this.send(subject, content, recipient);
    }
}

export default MailService;
