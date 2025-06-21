import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    // Step 1: Create the admin role in PostgreSQL if it doesn't exist
    const createRoleSQL = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
          CREATE ROLE admin;
        END IF;
      END
      $$;
    `;

    const { error: roleError } = await locals.supabase.rpc('exec_sql', { sql: createRoleSQL });
    if (roleError) {
      console.error('Error creating admin role:', roleError);
      return json({ 
        error: 'Error creating admin role',
        details: roleError.message 
      }, { status: 500 });
    }

    // Step 2: Grant necessary permissions to the admin role
    const grantPermissionsSQL = `
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
      GRANT ALL PRIVILEGES ON SCHEMA public TO admin;
    `;

    const { error: grantError } = await locals.supabase.rpc('exec_sql', { sql: grantPermissionsSQL });
    if (grantError) {
      console.error('Error granting permissions:', grantError);
      return json({ 
        error: 'Error granting permissions to admin role',
        details: grantError.message 
      }, { status: 500 });
    }

    // Step 3: Update the user's role in auth.users table
    const { data: updateResult, error: updateError } = await locals.supabase
      .from('auth.users')
      .update({ role: 'admin' })
      .eq('email', 'admin@domify.com')
      .select('id, email, role');

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return json({ 
        error: 'Error updating user role',
        details: updateError.message 
      }, { status: 500 });
    }

    // Step 4: Grant the admin role to the user
    const grantUserRoleSQL = `
      GRANT admin TO postgres;
    `;

    const { error: grantUserError } = await locals.supabase.rpc('exec_sql', { sql: grantUserRoleSQL });
    if (grantUserError) {
      console.error('Error granting admin role to user:', grantUserError);
      return json({ 
        error: 'Error granting admin role to user',
        details: grantUserError.message 
      }, { status: 500 });
    }

    return json({
      success: true,
      message: 'Admin role created and user updated successfully',
      user: updateResult?.[0],
      steps_completed: [
        'Admin role created in PostgreSQL',
        'Permissions granted to admin role',
        'User role updated in auth.users table',
        'Admin role granted to postgres user'
      ]
    });

  } catch (error) {
    console.error('Error in create-admin-role endpoint:', error);
    return json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 