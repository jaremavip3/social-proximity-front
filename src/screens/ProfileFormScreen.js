import React, { useState } from "react";
import * as Haptics from "expo-haptics";

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { SvgXml } from "react-native-svg";

const arrowBack = `
   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.1" d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" fill="#ffffff"></path> <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="#ffffff" stroke-width="2"></path> <path d="M8 12L16 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 9L8.08704 11.913V11.913C8.03897 11.961 8.03897 12.039 8.08704 12.087V12.087L11 15" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
`;

export default function ProfileFormScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    degree: "",
    university: "",
    skills: "",
    certification: "",
    project: "",
    companyInterests: "",
    email: "",
    hobbies: "",
    jobTitle: "",
  });
  const [errors, setErrors] = useState({}); // Validation errors
  const [isSubmitting, setIsSubmitting] = useState(false); // Form submission state

  // FUNCTION TO HANDLE INPUT CHANGES
  function handleChange(field, value) {
    setFormData({ ...formData, [field]: value }); // Update form data
    if (errors[field]) {
      // Clear errors if there are any for user to correct the field
      setErrors({ ...errors, [field]: null });
    }
  }

  // FUNCTION TO VALIDATE FORM DATA
  function validateForm() {
    let newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    } else if (isNaN(formData.age) || parseInt(formData.age) < 18) {
      newErrors.age = "Age must be a number and at least 18";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  }

  // FUNCTION TO HANDLE FORM SUBMISSION
  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors before submitting");
      return;
    }
    setIsSubmitting(true);
    // Submit the form data to the server
    console.log("Submitting form:", JSON.stringify(formData));
    try {
      // const response = await fetch("https://myapi.com/profile", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(formData),
      // });

      // if (response.ok) {
      //   const data = await response.json();
      //   console.log("Server response:", data);
      //   Alert.alert("Profile Created", "Your profile has been created successfully");
      //   navigation.navigate("Location");
      // } else {
      //   const errorData = await response.json();
      //   console.log("Server error:", errorData);
      //   Alert.alert("Error", "An error occurred. Please try again.");
      // }

      // __________TEST__________Simulate success for now
      setTimeout(() => {
        setIsSubmitting(false);
        Alert.alert("Success", "Your profile has been saved successfully!");
        navigation.navigate("Location");
      }, 1000);
    } catch (error) {
      console.log("Error submitting form:", error);
      setIsSubmitting(false);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  }

  const renderField = (label, field, placeholder, keyboardType = "default", multiline = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput, errors[field] ? styles.inputError : null]}
        placeholder={placeholder}
        placeholderTextColor="#FFFFFFCC"
        value={formData[field]}
        onChangeText={(text) => handleChange(field, text)}
        keyboardType={keyboardType}
        multiline={multiline}
        color="#fff"
      />
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );
  const handleGoToWelcome = () => {
    navigation.navigate("Welcome");
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <View style={styles.formContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Create Your Profile</Text>
              <TouchableOpacity
                style={styles.arrowBack}
                activeOpacity={0.5}
                onPress={() => {
                  handleGoToWelcome();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }}
              >
                <SvgXml xml={arrowBack} width={35} height={35} />
              </TouchableOpacity>
            </View>
            {renderField("Username (public)", "username", "Enter your unsername")}
            {renderField("Name", "name", "Enter your name")}
            {renderField("Email", "email", "Enter your email", "email-address")}
            {renderField(
              "Languages",
              "language",
              "Enter languages you speak (e.g., English, Spanish)",
              "default",
              true
            )}
            {renderField("Age", "age", "Enter your age", "numeric")}
            {renderField("Degree", "degree", "Enter your degree")}
            {renderField("University", "university", "Enter your university")}
            {renderField("Skills", "skills", "Enter your skills (e.g., React, JavaScript)", "default", true)}
            {renderField("Certification", "certification", "Enter your certifications")}
            {renderField("Project", "project", "Enter your projects", "default", true)}
            {renderField("Company Interests", "companyInterests", "Companies you are interested in")}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Hobbies (separate with commas)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Reading, Swimming, Hiking"
                placeholderTextColor="#FFFFFFCC"
                value={formData.hobbies}
                color="#fff"
                onChangeText={(text) => handleChange("hobbies", text)}
                multiline
              />
            </View>

            {renderField("Job Title", "jobTitle", "Enter your job title")}

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={() => {
                handleSubmit();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              activeOpacity={0.5}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting..." : "Submit Profile"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.5}
              onPress={() => {
                handleGoToWelcome();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }}
            >
              <Text style={styles.submitButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  arrowBack: {
    backgroundColor: "#0052CC",
    padding: 5,
    borderRadius: 13,
  },
  formContainer: {
    padding: 20,
    marginTop: 60,
    marginBottom: 60,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
    color: "#e6e6e6",
  },
  input: {
    // backgroundColor: "#fff",
    // borderWidth: 2,
    // borderStyle: "solid",
    // borderColor: "#4169E1",
    // padding: 10,
    // borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#161B2B", // Dark blue background for cards
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#4169E1",
    padding: 15,
    // marginBottom: 15,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#F5A623",
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
    borderRadius: 15,
  }, //F5A623
  backButton: {
    backgroundColor: "#0052CC",
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
    borderRadius: 15,
  }, //F5A623

  submitButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
