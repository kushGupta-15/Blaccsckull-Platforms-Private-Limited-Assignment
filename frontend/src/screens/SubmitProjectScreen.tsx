import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { submitProject, fetchMySubmission } from '../api/competitions';
import { showAlert } from '../utils/alert';

type Props = NativeStackScreenProps<RootStackParamList, 'SubmitProject'>;

const SubmitProjectScreen: React.FC<Props> = ({ route, navigation }) => {
  const { competitionId, competitionTitle, existingSubmission } = route.params;

  const [title, setTitle] = useState(existingSubmission?.title ?? '');
  const [description, setDescription] = useState(
    existingSubmission?.description ?? ''
  );
  const [repositoryUrl, setRepositoryUrl] = useState(
    existingSubmission?.repositoryUrl ?? ''
  );
  const [demoUrl, setDemoUrl] = useState(existingSubmission?.demoUrl ?? '');
  const [mediaUrl, setMediaUrl] = useState(existingSubmission?.mediaUrl ?? '');

  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(
    !existingSubmission
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!existingSubmission) {
      void (async () => {
        try {
          const mine = await fetchMySubmission(competitionId);
          if (mine) {
            setTitle(mine.title);
            setDescription(mine.description);
            setRepositoryUrl(mine.repositoryUrl);
            setDemoUrl(mine.demoUrl ?? '');
            setMediaUrl(mine.mediaUrl ?? '');
          }
        } catch {
          // No prior submission or not loaded — proceed with blank form
        } finally {
          setFetchingExisting(false);
        }
      })();
    }
  }, [competitionId, existingSubmission]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs['title'] = 'Project title is required';
    } else if (title.trim().length < 3) {
      errs['title'] = 'Title must be at least 3 characters';
    }

    if (!description.trim()) {
      errs['description'] = 'Description is required';
    } else if (description.trim().length < 10) {
      errs['description'] = 'Description must be at least 10 characters';
    }

    const urlPattern = /^https?:\/\/.+/i;

    if (!repositoryUrl.trim()) {
      errs['repositoryUrl'] = 'Repository URL is required';
    } else if (!urlPattern.test(repositoryUrl.trim())) {
      errs['repositoryUrl'] = 'Enter a valid URL (starting with http:// or https://)';
    }

    if (demoUrl.trim() && !urlPattern.test(demoUrl.trim())) {
      errs['demoUrl'] = 'Demo URL must start with http:// or https://';
    }

    if (mediaUrl.trim() && !urlPattern.test(mediaUrl.trim())) {
      errs['mediaUrl'] = 'Media URL must start with http:// or https://';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;

    try {
      setLoading(true);
      await submitProject(competitionId, {
        title: title.trim(),
        description: description.trim(),
        repositoryUrl: repositoryUrl.trim(),
        demoUrl: demoUrl.trim() || undefined,
        mediaUrl: mediaUrl.trim() || undefined,
      });

      showAlert(
        'Success! 🚀',
        'Your project has been successfully submitted for review.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to submit project. Please check requirements and try again.';
      showAlert('Submission Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingExisting) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Checking existing submission...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Submit Project
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🚀 Hackathon Project Submission</Text>
          <Text style={styles.infoSubtitle}>
            Submitting for: <Text style={styles.boldText}>{competitionTitle}</Text>
          </Text>
          <Text style={styles.infoNotice}>
            Ensure your GitHub repo has a clear README and your demo link is publicly accessible.
          </Text>
        </View>

        {/* Project Title */}
        <FormInput
          label="Project Title *"
          placeholder="e.g. AI-Powered Smart Assistant"
          value={title}
          onChangeText={(v) => {
            setTitle(v);
            if (errors['title']) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          error={errors['title']}
        />

        {/* Description */}
        <FormInput
          label="Project Summary & Architecture *"
          placeholder="Describe your solution, key features, and technology stack..."
          value={description}
          onChangeText={(v) => {
            setDescription(v);
            if (errors['description'])
              setErrors((prev) => ({ ...prev, description: '' }));
          }}
          multiline
          numberOfLines={5}
          style={styles.multilineInput}
          error={errors['description']}
        />

        {/* Repository URL */}
        <FormInput
          label="GitHub / Code Repository URL *"
          placeholder="https://github.com/username/project"
          value={repositoryUrl}
          onChangeText={(v) => {
            setRepositoryUrl(v);
            if (errors['repositoryUrl'])
              setErrors((prev) => ({ ...prev, repositoryUrl: '' }));
          }}
          autoCapitalize="none"
          keyboardType="url"
          error={errors['repositoryUrl']}
        />

        {/* Live Demo URL */}
        <FormInput
          label="Live Demo URL (Optional)"
          placeholder="https://my-project.vercel.app"
          value={demoUrl}
          onChangeText={(v) => {
            setDemoUrl(v);
            if (errors['demoUrl'])
              setErrors((prev) => ({ ...prev, demoUrl: '' }));
          }}
          autoCapitalize="none"
          keyboardType="url"
          error={errors['demoUrl']}
        />

        {/* Video / Media Demo */}
        <FormInput
          label="Video Demo / Preview Link (Optional)"
          placeholder="https://youtube.com/watch?v=... or Loom"
          value={mediaUrl}
          onChangeText={(v) => {
            setMediaUrl(v);
            if (errors['mediaUrl'])
              setErrors((prev) => ({ ...prev, mediaUrl: '' }));
          }}
          autoCapitalize="none"
          keyboardType="url"
          error={errors['mediaUrl']}
        />

        {/* Action Button */}
        <View style={styles.submitContainer}>
          <PrimaryButton
            label={loading ? 'Submitting...' : 'Submit Project 🚀'}
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 54 : SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  infoCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#4338CA',
  },
  infoTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#E0E7FF',
    marginBottom: SPACING.xs,
  },
  infoSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: '#C7D2FE',
    marginBottom: SPACING.xs,
  },
  boldText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoNotice: {
    fontSize: FONT_SIZE.xs,
    color: '#A5B4FC',
    lineHeight: 18,
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  submitContainer: {
    marginTop: SPACING.xl,
  },
});

export default SubmitProjectScreen;
