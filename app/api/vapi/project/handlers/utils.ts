interface ValidatedProjectArgs {
  clerkId: string;
  title: string;
  description: string;
  mainTasks: string[];
  deadline: string;
  dailyHours: number;
  weekendWork: boolean;
}

export const validateCreateProjectArgs = (
  args: Record<string, unknown>,
): boolean => {
  const {
    clerkId,
    title,
    description,
    mainTasks,
    deadline,
    dailyHours,
    weekendWork,
  } = args;

  if (!clerkId || typeof clerkId !== "string" || clerkId.trim().length === 0) {
    console.log("Validation failed: clerkId");
    return false;
  }

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    console.log("Validation failed: title");
    return false;
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    console.log("Validation failed: description");
    return false;
  }

  if (!Array.isArray(mainTasks) || mainTasks.length === 0) {
    console.log("Validation failed: mainTasks array");
    return false;
  }

  // Validate each task is a string
  if (
    !mainTasks.every(
      (task) => typeof task === "string" && task.trim().length > 0,
    )
  ) {
    console.log("Validation failed: mainTasks content");
    return false;
  }

  if (!deadline || typeof deadline !== "string") {
    console.log("Validation failed: deadline type");
    return false;
  }

  // Validate ISO date string format (VAPI sends format like "2025-06-14T00:34:26.250Z")
  const date = new Date(deadline);
  if (isNaN(date.getTime())) {
    console.log("Validation failed: deadline not parseable as date", deadline);
    return false;
  }

  // Check if deadline is in the future
  if (date <= new Date()) {
    console.log(
      "Validation failed: deadline not in future",
      deadline,
      "vs",
      new Date().toISOString(),
    );
    return false;
  }

  // More flexible ISO format check - just ensure it's a reasonable ISO string
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;
  if (!isoRegex.test(deadline)) {
    console.log("Validation failed: deadline format", deadline);
    return false;
  }

  if (typeof dailyHours !== "number" || dailyHours <= 0 || dailyHours > 24) {
    console.log("Validation failed: dailyHours", dailyHours);
    return false;
  }

  if (typeof weekendWork !== "boolean") {
    console.log("Validation failed: weekendWork");
    return false;
  }

  console.log("All validations passed!");
  return true;
};

export const validateAndReturnCreateProjectArgs = (
  args: Record<string, unknown>,
): ValidatedProjectArgs => {
  const {
    clerkId,
    title,
    description,
    mainTasks,
    deadline,
    dailyHours,
    weekendWork,
  } = args;

  console.log("Validating args:", JSON.stringify(args, null, 2));

  if (!validateCreateProjectArgs(args)) {
    throw new Error(
      "Invalid arguments provided. Check server logs for details.",
    );
  }

  // Return properly typed and sanitized arguments
  // Note: deadline is kept as string since that's how it's stored in the database
  return {
    clerkId: (clerkId as string).trim(),
    title: (title as string).trim(),
    description: (description as string).trim(),
    mainTasks: (mainTasks as string[]).map((task) => task.trim()),
    deadline: deadline as string, // Keep as ISO string
    dailyHours: dailyHours as number,
    weekendWork: weekendWork as boolean,
  };
};
