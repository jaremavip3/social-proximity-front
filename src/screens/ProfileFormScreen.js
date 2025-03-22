import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

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
      }
    }

    const renderField = (label, field, placeholder, keyboardType = "default", multiline = false) => (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput, errors[field] ? styles.inputError : null]}
          placeholder={placeholder}
          value={formData[field]}
          onChangeText={(text) => handleChange(field, text)}
          keyboardType={keyboardType}
          multiline={multiline}
        />
        {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
      </View>
    );

    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Your Profile</Text>

            {/* Form fields will go here */}

            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Submit Profile</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const styles = StyleSheet.create({
    // Styles will go here
  });
}
