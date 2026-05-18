// local
import styles from './contact.module.css';
import MainButton from '../../../components/ui/button/MainButton';
import MainInput from '../../../components/ui/input/MainInput';

// react
import { useEffect, useRef } from 'react';

// gsap
import { gsap } from 'gsap';

// toastify
import { toast } from 'react-toastify';

// email.js
import emailjs from '@emailjs/browser';

// react hook form
import { useForm } from 'react-hook-form';

// react icons
import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';

const Contact = () => {
    const mainRef = useRef(null);
    const infoRefs = useRef([]);
    const formRef = useRef(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm();

    // ── GSAP Animations ──────────────────────────
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Info cards pop in
            if (infoRefs.current.length > 0) {
                gsap.fromTo(
                    infoRefs.current,
                    { scale: 0.85, opacity: 0, y: 25 },
                    {
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.12,
                        ease: 'back.out(1.5)',
                        clearProps: 'all',
                    }
                );
            }

            // Form card slides in from right
            if (formRef.current) {
                gsap.fromTo(
                    formRef.current,
                    { x: 60, opacity: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 0.7,
                        ease: 'power3.out',
                        delay: 0.3,
                        clearProps: 'all',
                    }
                );
            }
        }, mainRef);

        return () => ctx.revert();
    }, []);

    const addToInfoRefs = (el) => {
        if (el && !infoRefs.current.includes(el)) {
            infoRefs.current.push(el);
        }
    };

    // ── Form Submit ──────────────────────────────
    const onSubmit = async (data) => {
        const toastId = toast.loading('Sending message...');
        try {
            const result = await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                data,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            toast.update(toastId, {
                render: 'Message sent successfully! I will get back to you soon.',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });

            // Reset fields
            setValue('firstName', '');
            setValue('lastName', '');
            setValue('email', '');
            setValue('phone', '');
            setValue('subject', '');
            setValue('message', '');

            return result;
        } catch (error) {
            console.error('Email Error:', error);
            toast.update(toastId, {
                render: 'Failed to send message. Please try again.',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    return (
        <main className={styles.container} ref={mainRef}>
            {/* Header */}
            <div className={styles.header}>
                <span className={styles.overline}>— 07 / GET IN TOUCH</span>
                <h1 className={styles.title}>Contact Me</h1>
                <p className={styles.subtitle}>
                    Have a project in mind or want to collaborate or you have a job offer ? I&apos;d love to hear from you.
                    Drop me a message and I&apos;ll get back to you as soon as possible.
                </p>
            </div>

            {/* Content Grid */}
            <div className={styles.contentGrid}>
                {/* ── Left: Info Column (About Website) ── */}
                <div className={styles.infoColumn}>
                    {/* About 1 */}
                    <div className={styles.infoCard} ref={addToInfoRefs}>
                        <div className={styles.infoIconBox}>
                            <FiMapPin />
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Your Data, Secure</span>
                            <span className={styles.infoValue}>
                                Moniq is built with bank-grade encryption. Your financial data is entirely local and strictly confidential.
                            </span>
                        </div>
                    </div>

                    {/* About 2 */}
                    <div className={styles.infoCard} ref={addToInfoRefs}>
                        <div className={styles.infoIconBox}>
                            <FiPhone />
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Always Available</span>
                            <span className={styles.infoValue}>
                                Works seamlessly across all your devices—desktop, tablet, and mobile. Access your finances anytime, anywhere.
                            </span>
                        </div>
                    </div>

                    {/* About 3 */}
                    <div className={styles.infoCard} ref={addToInfoRefs}>
                        <div className={styles.infoIconBox}>
                            <FiMail />
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Need Help?</span>
                            <span className={styles.infoValue}>
                                Have a question or facing an issue? Send us a message and our support team will assist you immediately.
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Right: Form Card ── */}
                <div className={styles.formCard} ref={formRef}>
                    <h2 className={styles.formTitle}>Send a Message</h2>
                    <p className={styles.formSubtitle}>
                        Fill in the details below and I&apos;ll respond within 24 hours.
                    </p>

                    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                        {/* Row 1: First & Last Name */}
                        <div className={styles.formRow}>
                            <MainInput
                                name="firstName"
                                title="First Name"
                                placeholder="Mohamed"
                                hasError={!!errors.firstName}
                                errorMsg={errors.firstName?.message}
                                register={register('firstName', {
                                    required: 'First name is required',
                                })}
                            />
                            <MainInput
                                name="lastName"
                                title="Last Name"
                                placeholder="Fayed"
                                hasError={!!errors.lastName}
                                errorMsg={errors.lastName?.message}
                                register={register('lastName', {
                                    required: 'Last name is required',
                                })}
                            />
                        </div>

                        {/* Row 2: Email & Phone */}
                        <div className={styles.formRow}>
                            <MainInput
                                type="email"
                                name="email"
                                title="Email"
                                placeholder="you@example.com"
                                icon={<FiMail />}
                                hasError={!!errors.email}
                                errorMsg={errors.email?.message}
                                register={register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Enter a valid email',
                                    },
                                })}
                            />
                            <MainInput
                                type="tel"
                                name="phone"
                                title="Phone (Optional)"
                                placeholder="+20 123 456 7890"
                                icon={<FiPhone />}
                                register={register('phone')}
                            />
                        </div>

                        {/* Subject (normal text input) */}
                        <MainInput
                            name="subject"
                            title="Subject"
                            placeholder="What is this about?"
                            hasError={!!errors.subject}
                            errorMsg={errors.subject?.message}
                            register={register('subject', {
                                required: 'Subject is required',
                            })}
                        />

                        {/* Message (textarea) */}
                        <div className={styles.textareaWrapper}>
                            <label htmlFor="message" className={styles.textareaLabel}>
                                Message
                            </label>
                            <textarea
                                id="message"
                                className={styles.textarea}
                                placeholder="Write your message here..."
                                rows={5}
                                data-error={errors.message ? 'true' : undefined}
                                {...register('message', {
                                    required: 'Message is required',
                                    minLength: {
                                        value: 10,
                                        message: 'Message must be at least 10 characters',
                                    },
                                })}
                            />
                            {errors.message && (
                                <p className={styles.errorMsg} role="alert">
                                    {errors.message.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <MainButton
                            type="submit"
                            action="primary"
                            size="lg"
                            title="Send Message"
                            isLoading={isSubmitting}
                            isDisabled={isSubmitting}
                            className={styles.submitBtn}
                        >
                            <FiSend /> Send Message
                        </MainButton>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default Contact;
