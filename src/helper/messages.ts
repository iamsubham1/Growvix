export const msg = {
    server: {
        error: 'Something went wrong. Please try after sometime.',
        requiredField: 'Please provide all required fields',
        registrationCodeMailSub: 'Registration Code',
        emailError: 'Unable to send mail',
    },
    auth: {
        missingCode: 'missing Code',
    },
    file: {
        uploadSuccess: 'file upload successfully',
    },
    catalogue: {
        fetchedSuccess: 'Order fetched successfully',
    },
    subscription: {
        failed: 'Failed to create subscription',
        success: 'Subscription created successfully',
        notFound: 'Subscription not found',
        updateSuccess: 'Subscription updated successfully',
        updateFailed: 'Failed to update subscription',
        deleteSuccess: 'Subscription deleted successfully',
        deleteError: 'Failed to delete subscription',
    },
    common: {
        createdSuccess: 'Created successfully.',
        updatedSuccess: 'Updated successfully.',
        deletedSuccess: 'Deleted successfully.',
        recordNotFound: 'Record Not Found.',
        recordFound: 'Record Found.',
        createdError: 'Error in creating.',
        updatedError: 'Error in updating.',
        deletedError: 'Error in deleting.',
        somethingWentWrong: 'Something went wrong!',
        emptyBody: 'Empty body',
        invalidRequest: 'Invalid Request',
    },
    token: {
        invalid: 'Invalid token in the request!',
        expired: 'Your token is expired!!',
        tokenNotFound: 'Authorization token is required!!',
        error: 'Error in verifying the token!!',
        accessDenied: 'Access Denied to perform this operation',
    },

    user: {
        userExist: 'User exist.',
        userEmailExist: 'email already exist.',
        userPhoneNumberExist: 'phone number already exist.',
        userEmailNotExist: 'email not exist.',
        userEmailAndPhoneNumberNotExist: 'Email and phonenumber doesnt exist.',
        userFound: 'User found',
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        passwordResetEmailSent: 'Reset Password Email Sent Successfully',
        userNotExist: 'User does not exist.',
        userIdNotFound: 'User id not found.',
        invalidCredentials: 'Invalid Credentials.',
        userSavedSuccess: 'User registered successfully.',
        oldPasswordError: 'Old Password is Invalid',
        passwordUpdatedSuccess: 'Password Updated successfully.',
        userUpdatedSuccess: 'User Information updated successfully.',
        loggedInSuccess: 'You Are Successfully Logged In.',
        logoutSuccess: 'You are successfully logged out.',
        emailNotFound: 'User email not found.',
        passwordNotMatched: 'Password not matched',
        recordDeleted: 'User deleted successfully.',
        passwordShouldNotSame: 'New password should not be same as old password',
        errorInDeletingRecord: 'Error in deleting record.',
        forgotPwdSuccess: 'Password sent successfully. Please check your Email.',
        forgotPwdError: 'Email address did not match with records.',
        inactiveStatus: 'Your account is not active',
        invalidToken: 'Token is empty or invalid Token.',
        loginError: 'Error in login.',
        errorInSaving: 'Error in saving user.',
        userProfileNotFound: 'Your profile not updated yet.',
        userSaveError: 'Error registering user!',
        userNotFound: 'User not found.',
        badRequest: 'Bad request',
        verifyUser: 'Please verified your email',
        emailVerified: 'Email verified success!!',
        userAccountDeactivated:
            'Your account is deleted, please use different mailYour account has been deleted by 7 Screening Room. Please use some other id to register or connect with 7 Screening Support.',
        duplicateUserId: 'Duplicate User',
        statusUpdate: 'Status Update successfully',
        accountStatusUpdate: 'Account status Update successfully',
        noDataToUpdate: 'NO Data for Update',
        sameDataForUpdate: 'Please Enter Different Data for Update',
        sendResetMail: 'Password Reset link has been send to your mail',
        ResetPasswordTokenExpire: 'Reset Password token is invalid or has been expired',
        ResetSuccess: 'Password Reset successfully',
        PasswordChangeSuccessfully: 'Password changed successfully',
        passwordCurrent: 'please current password',
        notAuthorized: 'You are not authorized to sign in',
        statusNotApproved: 'Your account is under review!!',
        userGroupNotApproved: 'User group not yet assigned!!',
        rejected: 'Your account is rejected',
        passwordError: 'Password must have 8 Char with One Lower and One Upper Character',
        newPasswordError: 'Password must have 8 Char with One Lower and One Upper Character',
        notArtist: 'You are not authorized',
        userDeletedSuccess: 'Delete Successfully',
        fetchedSuccessfully: 'Data fetched Successfully',
        fetchFailed: 'Failed to Fetch Data'
    },
    role: {
        accessDenied: 'You are not authorized to access this API.',
        notFound: 'Role not found.',
    },
    queryParams: {
        queryParamNotFound: 'Request query params not found!!',
    },
    notification: {
        enabled: 'Notifications enabled successfully',
        disabled: 'Notifications disabled successfully',
        notFound: 'Notification not found.',
        found: 'Notification found.',
        updated: 'Notification updated successfully.',
        deleted: 'Notification deleted successfully.',
        success: 'Notification created successfully.',
    },
    records: {
        created: 'Record Created Successfully',
        delete: 'Record Deleted Successfully',
        updated: 'Record Updated Successfully',
        notCreated: 'Failed to Create Record',
        notDeleted: 'Failed to Delete Record',
        notUpdated: 'Failed to Updated Record',
    },
    order: {
        createdSuccess: 'Order created successfully',
        fetchedSuccess: 'Order fetched successfully',
        notFound: 'Order not found',
        updatedSuccess: 'Order updated successfully',
        deletedSuccess: 'Order deleted successfully',
        validationError: 'Validation error in orders data',
        saveError: 'Error saving orders data',
        updateError: 'Error updating orders data',
        deleteError: 'Error deleting orders data',
        companyError: 'A valid company is required.',
        poNumberError: 'PO number is required',
        poDateError: 'PO date is required',
        poCopyError: 'PO copy information is required and must be a valid URL',
        categoryError: 'A valid orders type is required.',
        deliveryDateError: 'A valid delivery date is required.',
        productsError: 'Product details must be valid and conform to the product detail requirements.',
    },
    orderType: {
        createdSuccess: 'Order Type created successfully',
        fetchedSuccess: 'Order Type data fetched successfully',
        notFound: 'Order Type not found',
        updatedSuccess: 'Order Type updated successfully',
        deletedSuccess: 'Order Type deleted successfully',
        validationError: 'Validation error in Order Type data',
        saveError: 'Error saving Order Type data',
        updateError: 'Error updating Order Type data',
        deleteError: 'Error deleting Order Type data',
        alreadyExists: 'A Order Type with the provided identifier already exists',
        nameError: 'Order Type name is required.',
        descriptionError: 'Order Type Description is optional.',
        statusError: 'Status must be either 0 (inactive) or 1 (active).',
        createdAtError: 'Creation date should be automatically set to the current date.',
        updatedAtError: 'Update date should be automatically set to the current date.',
    },
    vendor: {
        createdSuccess: 'Vendor created successfully',
        fetchedSuccess: 'Vendor data fetched successfully',
        notFound: 'Vendor not found',
        updatedSuccess: 'Vendor updated successfully',
        deletedSuccess: 'Vendor deleted successfully',
        validationError: 'Validation error in vendor data',
        saveError: 'Error saving vendor data',
        updateError: 'Error updating vendor data',
        deleteError: 'Error deleting vendor data',
        alreadyExists: 'A vendor with the provided identifier already exists',
        nameError: 'The vendor name must be at least 3 characters long.',
        contactEmailError: 'Please enter a valid contact email address.',
        contactNumberError: 'The contact number must be between 10 to 15 digits long and contain only numbers.',
        addressError: 'The address must be at least 5 characters long.',
    },
    brand: {
        fetchedSuccess: 'Brand data fetched successfully',
        createdSucsess: 'Brand Created Successfully',
        notFound: 'Brand Not Found',
        deleteSuccessfull: 'Brand Deleted Successfully',
    },
    employee: {
        required: 'Employee Data is required',
        createdSuccess: 'Employee created successfully',
        fetchedSuccess: 'Employee data fetched successfully',
        notFound: 'Employee not found',
        updatedSuccess: 'Employee updated successfully',
        deletedSuccess: 'Employee deleted successfully',
        validationError: 'Validation error in vendor data',
        saveError: 'Error saving vendor data',
        updateError: 'Error updating vendor data',
        deleteError: 'Error deleting vendor data',
        alreadyExists: 'A vendor with the provided identifier already exists',
        bulkUploadSuccess: 'Upload Success',
        nameError: 'Employee name is required and must be at least 3 characters long.',
        mobileError: 'A valid 10-digit mobile number is required.',
        addressError: 'Address is required for delivery.',
        emailError: 'A valid email address is required for the employee.',
        dateError: 'A valid date is required.',
        orderIdError: 'An order ID is required.',
        orderStatusError: 'Valid order status details are required.',
        orderStatusDateError: 'A valid status date is required.',
        orderStatusNameError: 'A valid order status name is required.',
    },
    product: {
        createdSuccess: 'Product created successfully',
        fetchedSuccess: 'Product data fetched successfully',
        notFound: 'Product not found',
        updatedSuccess: 'Product updated successfully',
        deletedSuccess: 'Product deleted successfully',
        validationError: 'Validation error in product data',
        saveError: 'Error saving product data',
        updateError: 'Error updating product data',
        deleteError: 'Error deleting product data',
        alreadyExists: 'A product with the provided identifier already exists',
        nameError: 'Product Name must be 3 characters long.',
        categoryError: 'Product category is required.',
        vendorError: 'Vendor information is required',
        specificationError: 'Specification details is required.',
        imageError: 'Product Image link must be a valid URL.',
        priceError: 'The price must be a valid number and can optionally include up to two decimal places (e.g., 999 or 999.99).',
        stockError: 'Stock must be a valid integer number.',
    },
    productCategory: {
        createdSuccess: 'Product category created successfully',
        fetchedSuccess: 'Product category data fetched successfully',
        notFound: 'Product category not found',
        updatedSuccess: 'Product category updated successfully',
        deletedSuccess: 'Product category deleted successfully',
        validationError: 'Validation error in product category data',
        saveError: 'Error saving product category data',
        updateError: 'Error updating product category data',
        deleteError: 'Error deleting product category data',
        alreadyExists: 'A product category with the provided identifier already exists',
        nameError: 'Category name is required.',

        descriptionError: 'Description is optional.',
        statusError: 'Status must be either 0 (inactive) or 1 (active).',
        createdAtError: 'Creation date should be automatically set to the current date.',
        updatedAtError: 'Update date should be automatically set to the current date.',
    },
    company: {
        nameError: 'The company name must be at least 3 characters long.',
        POCEmailError: 'Please enter a valid point of contact email address.',
        POCNameError: 'The point of contact name must be at least 3 characters long.',
        emailError: 'Please enter a valid company email address.',
        addressError: 'The company address must be at least 5 characters long.',
        websiteError: 'Please enter a valid company website URL.',
        gstError: 'The GST number must be exactly 15 digits.',
        POCContactError: 'The point of contact phone number must be exactly 10 digits long and contain only numbers.',
        createdSuccess: 'Company created successfully',
        fetchedSuccess: 'Company data fetched successfully',
        notFound: 'Company not found',
        updatedSuccess: 'Company updated successfully',
        deletedSuccess: 'Company deleted successfully',
        validationError: 'Validation error in company data',
        saveError: 'Error saving company data',
        updateError: 'Error updating company data',
        deleteError: 'Error deleting company data',
        alreadyExists: 'A company with the provided identifier already exists',
        required: 'Company Id is rquired',
    },

    catalouge: {
        nameError: 'Name is required',
        createdSuccess: 'catalouge created successfully',
        fetchedSuccess: 'catalouge data fetched successfully',
        notFound: 'catalouge not found',
        updatedSuccess: 'catalouge updated successfully',
        updated: 'catalouge updated successfully',
        deletedSuccess: 'catalouge deleted successfully',
        validationError: 'Validation error in catalouge data',
        saveError: 'Error saving catalouge data',
        updateError: 'Error updating catalouge data',
        deleteError: 'Error deleting catalouge data',
        alreadyExists: 'A catalouge with the provided identifier already exists',
        required: 'catalouge Id is rquired',
        comboIdRequired: 'Combo Id is required',
        comboUpdated: 'Combo Catalouge updated successfully',
        fileNotUploaded: 'No file uploaded. Please check your file',
        fileUploaded: 'File Uploaded Successfully',
    },

    productDetail: {
        productError: 'A valid product ID is required.',
        quantityError: 'Quantity must be a positive number.',
        costPriceError: 'Cost price must be a non-negative number.',
        sellingPriceError: 'Selling price must be a non-negative number.',
        cdrError: 'CDR file information is required.',
        pdfError: 'PDF file information is required.',
        employeeIdError: 'A valid employee ID is required.',
        orderIdError: 'Order ID is required.',
        orderStatusError: 'Order status is required.',
        employeesError: 'Employee details must be valid.',
    },

    payment: {
        success: 'Payment successful',
        failed: 'Payment failed',
    },
    plan: {
        success: 'Plan added successfully',
        failed: 'Failed to add plan',
        notFound: 'Plan not found',
        deleteError: 'Failed to delete plan',
        deleteSuccess: 'Plan deleted successfully',
        updateSuccess: 'Plan updated successfully',
        updateFailed: 'Failed to update the plan',
        fetchedSuccess: 'Plans fetched successfully',
        fetchFailed: 'Sorry failed to fetch plans',
    },
    billingType: {
        success: 'Billing type added successfully',
        failed: 'Failed to add billing type',
        notFound: 'Billing type not found',
        deleteError: 'Failed to delete billing type',
        deleteSuccess: 'Billing type deleted successfully',
        updateSuccess: 'Billing type updated successfully',
        updateFailed: 'Failed to update the billing type',
        fetchedSuccess: 'Billing types fetched successfully',
        fetchFailed: 'Failed to fetch billing types',
    },
    post: {
        success: 'Post added successfully',
        failed: 'Failed to add post',
        notFound: 'Post not found',
        deleteError: 'Failed to delete post',
        deleteSuccess: 'Post deleted successfully',
        updateSuccess: 'Post updated successfully',
        updateFailed: 'Failed to update the post',
        fetchedSuccess: 'Posts fetched successfully',
        fetchFailed: 'Sorry, failed to fetch posts',
    }


};
