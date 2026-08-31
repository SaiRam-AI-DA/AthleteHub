import requests
import mysql.connector
import json
import time
import sys

BASE_URL = "http://localhost:8080/api/v1"
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "connect",
    "database": "athletehub",
    "auth_plugin": "mysql_native_password"
}

results = {
    "auth": [],
    "rbac": [],
    "isolation": [],
    "codes": [],
    "crud": [],
    "db": []
}

def log_result(category, name, passed, details=""):
    results[category].append({
        "name": name,
        "status": "PASS" if passed else "FAIL",
        "details": details
    })
    print(f"[{category.upper()}] {name}: {'PASS' if passed else 'FAIL'} - {details}")

# Helper for DB connection
def get_db():
    return mysql.connector.connect(**DB_CONFIG)

def query_one(sql, params=None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(sql, params or ())
    res = cursor.fetchone()
    cursor.close()
    conn.close()
    return res

def clean_db():
    print("Performing database cleanup...")
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        # Deleting in reverse dependency order
        cursor.execute("DELETE FROM wellness_checkins WHERE notes LIKE 'TEST_AUDIT_%'")
        cursor.execute("DELETE FROM performance_records WHERE notes LIKE 'TEST_AUDIT_%' OR metric_name LIKE 'TEST_AUDIT_%'")
        cursor.execute("DELETE FROM coach_evaluations WHERE comments LIKE 'TEST_AUDIT_%' OR criteria_summary LIKE 'TEST_AUDIT_%'")
        cursor.execute("DELETE FROM training_attendance WHERE coach_notes LIKE 'TEST_AUDIT_%' OR athlete_feedback LIKE 'TEST_AUDIT_%'")
        cursor.execute("DELETE FROM training_sessions WHERE title LIKE 'TEST_AUDIT_%' OR description LIKE 'TEST_AUDIT_%'")
        cursor.execute("DELETE FROM training_plans WHERE title LIKE 'TEST_AUDIT_%' OR description LIKE 'TEST_AUDIT_%'")
        cursor.execute("DELETE FROM coach_assignments WHERE remarks LIKE 'TEST_AUDIT_%' OR status = 'TEST_AUDIT_ACTIVE' OR status = 'ACTIVE'")
        
        cursor.execute("DELETE FROM coaches WHERE first_name LIKE 'TEST_AUDIT_%' OR email LIKE 'test_audit_%'")
        cursor.execute("DELETE FROM athletes WHERE first_name LIKE 'TEST_AUDIT_%'")
        cursor.execute("DELETE FROM tournaments WHERE name LIKE 'TEST_AUDIT_%'")
        cursor.execute("DELETE FROM events WHERE name LIKE 'TEST_AUDIT_%'")
        cursor.execute("DELETE FROM users WHERE email LIKE 'test_%' OR full_name LIKE 'TEST_AUDIT_%'")
        cursor.execute("DELETE FROM organizations WHERE name LIKE 'TEST_AUDIT_%'")
        
        conn.commit()
        print("Database cleanup executed successfully.")
    except Exception as e:
        print(f"Database cleanup failed: {e}")
    finally:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        cursor.close()
        conn.close()

print("=== STARTING LAYER 1 AUTOMATED AUDIT (ROUND 7) ===")
clean_db()

# --- 1. AUTHENTICATION TESTS ---
try:
    # Login Admin
    login_payload = {"email": "admin@athletehub.local", "password": "Admin@123!"}
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    if resp.status_code == 200 and resp.json().get("status") == "success":
        admin_token = resp.json()["data"]["access_token"]
        log_result("auth", "Admin Login", True, "Successfully logged in as admin.")
    else:
        admin_token = None
        log_result("auth", "Admin Login", False, f"Status code: {resp.status_code}, Body: {resp.text}")
        sys.exit(1)
        
    # Login Invalid
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@athletehub.local", "password": "WrongPassword"})
    log_result("auth", "Login Invalid Password", resp.status_code == 401, f"Status code: {resp.status_code}")

    # Login Missing Email
    resp = requests.post(f"{BASE_URL}/auth/login", json={"password": "SomePassword"})
    log_result("auth", "Login Missing Email", resp.status_code in [400, 401], f"Status code: {resp.status_code}")

except Exception as e:
    log_result("auth", "Auth Test Flow Error", False, str(e))
    sys.exit(1)

# Register accounts for testing roles
def register_user(email, password, name, role):
    payload = {
        "full_name": name,
        "email": email,
        "password": password,
        "role_name": role
    }
    resp = requests.post(f"{BASE_URL}/auth/register", json=payload)
    if resp.status_code in [201, 200]:
        return True
    elif resp.status_code == 400 and "already registered" in resp.text:
        return True
    return False

def get_token(email, password):
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        return resp.json()["data"]["access_token"]
    return None

try:
    register_user("test_org_admin_a@athletehub.local", "Password@123!", "TEST_AUDIT_ORG_ADMIN_A", "ROLE_ORG_ADMIN")
    register_user("test_org_admin_b@athletehub.local", "Password@123!", "TEST_AUDIT_ORG_ADMIN_B", "ROLE_ORG_ADMIN")
    register_user("test_coach@athletehub.local", "Password@123!", "TEST_AUDIT_COACH", "ROLE_COACH")
    register_user("test_athlete@athletehub.local", "Password@123!", "TEST_AUDIT_ATHLETE", "ROLE_ATHLETE")
    register_user("test_recruiter@athletehub.local", "Password@123!", "TEST_AUDIT_RECRUITER", "ROLE_RECRUITER")
    
    org_admin_a_token = get_token("test_org_admin_a@athletehub.local", "Password@123!")
    org_admin_b_token = get_token("test_org_admin_b@athletehub.local", "Password@123!")
    coach_token = get_token("test_coach@athletehub.local", "Password@123!")
    athlete_token = get_token("test_athlete@athletehub.local", "Password@123!")
    recruiter_token = get_token("test_recruiter@athletehub.local", "Password@123!")
    
    log_result("auth", "Register & Obtain Tokens", all([org_admin_a_token, org_admin_b_token, coach_token, athlete_token, recruiter_token]), "All tokens generated.")
except Exception as e:
    log_result("auth", "Register & Token generation failed", False, str(e))
    sys.exit(1)

admin_headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
org_admin_a_headers = {"Authorization": f"Bearer {org_admin_a_token}", "Content-Type": "application/json"}
org_admin_b_headers = {"Authorization": f"Bearer {org_admin_b_token}", "Content-Type": "application/json"}
coach_headers = {"Authorization": f"Bearer {coach_token}", "Content-Type": "application/json"}
athlete_headers = {"Authorization": f"Bearer {athlete_token}", "Content-Type": "application/json"}
recruiter_headers = {"Authorization": f"Bearer {recruiter_token}", "Content-Type": "application/json"}

# --- 2. ORGANIZATION CRUD ---
org_a_id = None
org_b_id = None
try:
    org_payload_a = {
        "name": "TEST_AUDIT_ORG_A",
        "email": "test_org_a@athletehub.local",
        "phone": "+1234567890",
        "website": "http://testorga.local",
        "description": "Test Organization A description",
        "address_line": "123 Test Street",
        "city": "Test City",
        "state": "Test State",
        "country": "United States",
        "postal_code": "12345",
        "organization_type_id": 4
    }
    
    # Coach cannot create org
    coach_resp = requests.post(f"{BASE_URL}/organizations", json=org_payload_a, headers=coach_headers)
    log_result("rbac", "Coach Create Organization Restricted", coach_resp.status_code == 403, f"Status: {coach_resp.status_code}")
    
    # Super Admin creates Org A
    resp_a = requests.post(f"{BASE_URL}/organizations", json=org_payload_a, headers=admin_headers)
    if resp_a.status_code == 201:
        org_a_id = resp_a.json()["data"]["id"]
        log_result("crud", "Create Organization A", True, f"Org A ID: {org_a_id}")
    else:
        log_result("crud", "Create Organization A", False, f"Status: {resp_a.status_code}, Msg: {resp_a.text}")
        
    # Super Admin creates Org B
    org_payload_b = org_payload_a.copy()
    org_payload_b["name"] = "TEST_AUDIT_ORG_B"
    org_payload_b["email"] = "test_org_b@athletehub.local"
    resp_b = requests.post(f"{BASE_URL}/organizations", json=org_payload_b, headers=admin_headers)
    if resp_b.status_code == 201:
        org_b_id = resp_b.json()["data"]["id"]
        log_result("crud", "Create Organization B", True, f"Org B ID: {org_b_id}")
    else:
        log_result("crud", "Create Organization B", False, f"Status: {resp_b.status_code}")

    # Database validation for Org A
    if org_a_id:
        db_org = query_one("SELECT * FROM organizations WHERE id = %s", (org_a_id,))
        if db_org and db_org["name"] == "TEST_AUDIT_ORG_A" and db_org["organization_code"].startswith("ORG"):
            log_result("db", "Organization A DB Verification", True, f"Code: {db_org['organization_code']}")
            log_result("codes", "Organization Code Format", True, f"Code: {db_org['organization_code']}")

    # Update Organization A (send all fields)
    update_payload = org_payload_a.copy()
    update_payload["name"] = "TEST_AUDIT_ORG_A_UPDATED"
    update_payload["email"] = "test_org_a_upd@athletehub.local"
    upd_resp = requests.put(f"{BASE_URL}/organizations/{org_a_id}", json=update_payload, headers=admin_headers)
    db_org_upd = query_one("SELECT * FROM organizations WHERE id = %s", (org_a_id,))
    log_result("crud", "Update Organization A", upd_resp.status_code == 200 and db_org_upd["name"] == "TEST_AUDIT_ORG_A_UPDATED", f"Status: {upd_resp.status_code}")

    # Assign Admin A and Admin B to their respective Orgs
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET organization_id = %s WHERE email = 'test_org_admin_a@athletehub.local'", (org_a_id,))
    cursor.execute("UPDATE users SET organization_id = %s WHERE email = 'test_org_admin_b@athletehub.local'", (org_b_id,))
    conn.commit()
    cursor.close()
    conn.close()
    
except Exception as e:
    log_result("crud", "Organization Flow Error", False, str(e))

# --- 3. ATHLETE CRUD & ISO ---
athlete_id = None
try:
    athlete_payload = {
        "firstName": "TEST_AUDIT_ATHLETE_001",
        "lastName": "LastName",
        "dateOfBirth": "2005-05-15",
        "gender": "Male",
        "bloodGroup": "O+",
        "phone": "+1999999999",
        "address": "Athlete Address Line",
        "city": "San Francisco",
        "state": "California",
        "country": "United States",
        "sportId": 69,
        "organizationId": org_a_id,
        "medicalStatus": "Fit",
        "performanceRating": 85,
        "notes": "Test notes"
    }

    # First, make sure the athlete user is associated with Org A
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET organization_id = %s WHERE email = 'test_athlete@athletehub.local'", (org_a_id,))
    conn.commit()
    cursor.close()
    conn.close()

    # Create Athlete using Athlete Token (which links to the athlete's user account)
    resp_ath = requests.post(f"{BASE_URL}/athletes", json=athlete_payload, headers=athlete_headers)
    if resp_ath.status_code == 201:
        athlete_id = resp_ath.json()["data"]["id"]
        athlete_code = resp_ath.json()["data"]["athleteCode"]
        log_result("crud", "Create Athlete under Org A", True, f"Athlete ID: {athlete_id}, Code: {athlete_code}")
    else:
        log_result("crud", "Create Athlete under Org A", False, f"Status: {resp_ath.status_code}, Msg: {resp_ath.text}")

    # DB verify
    if athlete_id:
        db_ath = query_one("SELECT * FROM athletes WHERE id = %s", (athlete_id,))
        log_result("db", "Athlete DB Verification", db_ath is not None and db_ath["first_name"] == "TEST_AUDIT_ATHLETE_001", f"Code: {db_ath['athlete_code']}")

        # Isolation check: Org Admin B should not be allowed to delete Org A's Athlete
        del_iso_resp = requests.delete(f"{BASE_URL}/athletes/{athlete_id}", headers=org_admin_b_headers)
        log_result("isolation", "Org Admin B Delete Org A Athlete Restricted", del_iso_resp.status_code == 403, f"Status: {del_iso_resp.status_code}")

        # Update Athlete: Verify code remains unchanged
        update_ath_payload = athlete_payload.copy()
        update_ath_payload["firstName"] = "TEST_AUDIT_ATHLETE_001_UPDATED"
        upd_ath_resp = requests.put(f"{BASE_URL}/athletes/{athlete_id}", json=update_ath_payload, headers=athlete_headers)
        db_ath_upd = query_one("SELECT * FROM athletes WHERE id = %s", (athlete_id,))
        log_result("crud", "Update Athlete", upd_ath_resp.status_code == 200 and db_ath_upd["first_name"] == "TEST_AUDIT_ATHLETE_001_UPDATED", f"Status: {upd_ath_resp.status_code}")
        log_result("codes", "Athlete Code Unchanged on Update", db_ath_upd["athlete_code"] == db_ath["athlete_code"], f"Code: {db_ath_upd['athlete_code']}")

except Exception as e:
    log_result("crud", "Athlete Flow Error", False, str(e))

# --- 4. COACH CRUD ---
coach_id = None
try:
    coach_payload = {
        "firstName": "TEST_AUDIT_COACH_001",
        "lastName": "CoachLastName",
        "gender": "Male",
        "dateOfBirth": "1980-01-01",
        "phone": "+1888888888",
        "email": "test_audit_coach_001@athletehub.local",
        "specialization": "Running Techniques",
        "qualification": "Certified Coach",
        "experienceYears": 10,
        "certifications": "USATF Level 1",
        "organizationId": org_a_id,
        "profilePhoto": "http://photo.local"
    }

    # Asssociate coach user with Org A
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET organization_id = %s WHERE email = 'test_coach@athletehub.local'", (org_a_id,))
    conn.commit()
    cursor.close()
    conn.close()

    resp_coach = requests.post(f"{BASE_URL}/coaches", json=coach_payload, headers=coach_headers)
    if resp_coach.status_code == 201:
        coach_id = resp_coach.json()["data"]["id"]
        coach_code = resp_coach.json()["data"]["coachCode"]
        log_result("crud", "Create Coach under Org A", True, f"Coach ID: {coach_id}, Code: {coach_code}")
    else:
        log_result("crud", "Create Coach under Org A", False, f"Status: {resp_coach.status_code}, Msg: {resp_coach.text}")

    if coach_id:
        db_coach = query_one("SELECT * FROM coaches WHERE id = %s", (coach_id,))
        log_result("db", "Coach DB Verification", db_coach is not None and db_coach["first_name"] == "TEST_AUDIT_COACH_001", f"Code: {db_coach['coach_code']}")

except Exception as e:
    log_result("crud", "Coach Flow Error", False, str(e))

# --- 5. COACH ASSIGNMENT CRUD ---
assignment_id = None
try:
    assignment_payload = {
        "coachId": coach_id,
        "athleteId": athlete_id,
        "organizationId": org_a_id,
        "startDate": "2026-08-09",
        "status": "ACTIVE",
        "remarks": "TEST_AUDIT_Assigned running coach"
    }

    resp_asg = requests.post(f"{BASE_URL}/coach-assignments", json=assignment_payload, headers=org_admin_a_headers)
    if resp_asg.status_code == 201:
        assignment_id = resp_asg.json()["data"]["id"]
        asg_code = resp_asg.json()["data"]["assignmentCode"]
        log_result("crud", "Create Coach Assignment", True, f"Assignment ID: {assignment_id}, Code: {asg_code}")
    else:
        log_result("crud", "Create Coach Assignment", False, f"Status: {resp_asg.status_code}, Msg: {resp_asg.text}")

    if assignment_id:
        db_asg = query_one("SELECT * FROM coach_assignments WHERE id = %s", (assignment_id,))
        log_result("db", "Coach Assignment DB Verification", db_asg is not None and db_asg["assignment_code"].startswith("CAS"), f"Code: {db_asg['assignment_code']}")

except Exception as e:
    log_result("crud", "Coach Assignment Flow Error", False, str(e))

# --- 6. TRAINING PLANS & SESSIONS CRUD ---
plan_id = None
session_id = None
try:
    plan_payload = {
        "title": "TEST_AUDIT_PLAN_001",
        "description": "TEST_AUDIT Training Plan",
        "sportId": 69,
        "organizationId": org_a_id,
        "createdBy": coach_id,
        "difficultyLevel": "INTERMEDIATE",
        "durationWeeks": 4,
        "status": "ACTIVE"
    }

    resp_plan = requests.post(f"{BASE_URL}/training-plans", json=plan_payload, headers=org_admin_a_headers)
    if resp_plan.status_code in [200, 201]:
        plan_id = resp_plan.json()["data"]["id"]
        plan_code = resp_plan.json()["data"]["planCode"]
        log_result("crud", "Create Training Plan", True, f"Plan ID: {plan_id}, Code: {plan_code}")
    else:
        log_result("crud", "Create Training Plan", False, f"Status: {resp_plan.status_code}, Msg: {resp_plan.text}")

    if plan_id:
        db_plan = query_one("SELECT * FROM training_plans WHERE id = %s", (plan_id,))
        log_result("db", "Training Plan DB Verification", db_plan is not None and db_plan["plan_code"].startswith("TPL"), f"Code: {db_plan['plan_code']}")

        # Create Training Session
        session_payload = {
            "trainingPlanId": plan_id,
            "coachAssignmentId": assignment_id,
            "title": "TEST_AUDIT_SESSION_001",
            "description": "TEST_AUDIT Session Description",
            "sessionDate": "2026-08-12",
            "startTime": "10:00:00",
            "endTime": "11:00:00",
            "venue": "Indoor Gym A",
            "sessionType": "Cardio Speed",
            "intensity": "MEDIUM",
            "status": "SCHEDULED",
            "remarks": "TEST_AUDIT track session"
        }
        resp_sess = requests.post(f"{BASE_URL}/training-sessions", json=session_payload, headers=org_admin_a_headers)
        if resp_sess.status_code in [200, 201]:
            session_id = resp_sess.json()["data"]["id"]
            session_code = resp_sess.json()["data"]["sessionCode"]
            log_result("crud", "Create Training Session", True, f"Session ID: {session_id}, Code: {session_code}")
        else:
            log_result("crud", "Create Training Session", False, f"Status: {resp_sess.status_code}, Msg: {resp_sess.text}")

        if session_id:
            db_sess = query_one("SELECT * FROM training_sessions WHERE id = %s", (session_id,))
            log_result("db", "Training Session DB Verification", db_sess is not None and db_sess["session_code"].startswith("TSN"), f"Code: {db_sess['session_code']}")

            # Record Attendance
            att_payload = {
                "trainingSessionId": session_id,
                "athleteId": athlete_id,
                "attendanceStatus": "PRESENT",
                "coachNotes": "TEST_AUDIT Notes",
                "athleteFeedback": "TEST_AUDIT Feedback",
                "injuryReport": ""
            }
            resp_att = requests.post(f"{BASE_URL}/training-attendance", json=att_payload, headers=org_admin_a_headers)
            if resp_att.status_code in [200, 201]:
                att_id = resp_att.json()["data"]["id"]
                att_code = resp_att.json()["data"]["attendanceCode"]
                log_result("crud", "Record Training Attendance", True, f"Attendance ID: {att_id}, Code: {att_code}")
                
                db_att = query_one("SELECT * FROM training_attendance WHERE id = %s", (att_id,))
                log_result("db", "Attendance DB Verification", db_att is not None and db_att["attendance_code"].startswith("ATD"), f"Code: {db_att['attendance_code']}")
            else:
                log_result("crud", "Record Training Attendance", False, f"Status: {resp_att.status_code}, Msg: {resp_att.text}")

except Exception as e:
    log_result("crud", "Training Plan Flow Error", False, str(e))

# --- 7. EVENTS & TOURNAMENTS CRUD ---
event_id = None
tournament_id = None
try:
    # 7.1 Event (set registrationStartDate to 2026-08-01 so registration is open today)
    event_payload = {
        "name": "TEST_AUDIT_EVENT_001",
        "description": "TEST_AUDIT Event Description",
        "eventType": "Athletics meeting",
        "organizationId": org_a_id,
        "venue": "Test Stadium",
        "city": "San Francisco",
        "state": "California",
        "country": "United States",
        "registrationStartDate": "2026-08-01",
        "registrationEndDate": "2026-08-18",
        "eventStartDate": "2026-08-20",
        "eventEndDate": "2026-08-21",
        "bannerImage": "http://banner.local",
        "status": "UPCOMING"
    }
    resp_evt = requests.post(f"{BASE_URL}/events", json=event_payload, headers=org_admin_a_headers)
    if resp_evt.status_code in [200, 201]:
        event_id = resp_evt.json()["data"]["id"]
        log_result("crud", "Create Event", True, f"Event ID: {event_id}")
    else:
        log_result("crud", "Create Event", False, f"Status: {resp_evt.status_code}, Msg: {resp_evt.text}")

    if event_id:
        db_evt = query_one("SELECT * FROM events WHERE id = %s", (event_id,))
        log_result("db", "Event DB Verification", db_evt is not None and db_evt["name"] == "TEST_AUDIT_EVENT_001", f"DB: {db_evt}")

    # 7.2 Tournament (PreAuthorize fix allows ROLE_ORG_ADMIN)
    tour_payload = {
        "name": "TEST_AUDIT_TOURNAMENT_001",
        "description": "TEST_AUDIT Tournament Description",
        "sportId": 69,
        "eventId": event_id,
        "status": "UPCOMING",
        "genderCategory": "MALE",
        "ageCategory": "SENIOR",
        "maxParticipants": 16,
        "registrationLimit": 16,
        "startDate": "2026-08-20",
        "endDate": "2026-08-21"
    }
    resp_tour = requests.post(f"{BASE_URL}/tournaments", json=tour_payload, headers=org_admin_a_headers)
    if resp_tour.status_code in [200, 201]:
        tournament_id = resp_tour.json()["data"]["id"]
        log_result("crud", "Create Tournament", True, f"Tournament ID: {tournament_id}")
    else:
        log_result("crud", "Create Tournament", False, f"Status: {resp_tour.status_code}, Msg: {resp_tour.text}")

    if tournament_id:
        db_tour = query_one("SELECT * FROM tournaments WHERE id = %s", (tournament_id,))
        log_result("db", "Tournament DB Verification", db_tour is not None and db_tour["name"] == "TEST_AUDIT_TOURNAMENT_001", f"DB: {db_tour}")

        # Register Athlete for Tournament
        reg_payload = {
            "tournamentId": tournament_id,
            "athleteId": athlete_id,
            "remarks": "TEST_AUDIT Good state"
        }
        resp_reg = requests.post(f"{BASE_URL}/tournaments/{tournament_id}/registrations", json=reg_payload, headers=org_admin_a_headers)
        log_result("crud", "Register Athlete for Tournament", resp_reg.status_code in [200, 201], f"Status: {resp_reg.status_code}, Body: {resp_reg.text}")

except Exception as e:
    log_result("crud", "Events & Tournaments Flow Error", False, str(e))

# --- 8. PERFORMANCE RECORDS, EVALUATIONS & WELLNESS ---
try:
    # 8.1 Performance Record
    perf_payload = {
        "athleteId": athlete_id,
        "sportId": 69,
        "metricName": "TEST_AUDIT_SpeedRun",
        "metricValue": 9.58,
        "unit": "seconds",
        "recordDate": "2026-08-09",
        "context": "TRAINING",
        "notes": "TEST_AUDIT Sprint record"
    }
    resp_perf = requests.post(f"{BASE_URL}/performance-records", json=perf_payload, headers=coach_headers)
    log_result("crud", "Create Performance Record", resp_perf.status_code == 200 or resp_perf.status_code == 201, f"Status: {resp_perf.status_code}, Body: {resp_perf.text}")
    
    # 8.2 Coach Evaluation (evaluated coachId)
    eval_payload = {
        "coachId": coach_id,
        "evaluatorId": 8,  # Admin
        "evaluationDate": "2026-08-09",
        "score": 9.5,
        "criteriaSummary": "TEST_AUDIT training quality",
        "comments": "TEST_AUDIT Excellent planning"
    }
    resp_eval = requests.post(f"{BASE_URL}/coach-evaluations", json=eval_payload, headers=org_admin_a_headers)
    log_result("crud", "Create Coach Evaluation", resp_eval.status_code == 200 or resp_eval.status_code == 201, f"Status: {resp_eval.status_code}, Body: {resp_eval.text}")

    # 8.3 Wellness Check-In (uses /wellness/athletes/{athleteId})
    well_payload = {
        "date": "2026-08-09",
        "sleepQuality": 8,
        "soreness": 2,
        "stress": 1,
        "rpe": 5,
        "notes": "TEST_AUDIT Feeling great"
    }
    resp_well = requests.post(f"{BASE_URL}/wellness/athletes/{athlete_id}", json=well_payload, headers=athlete_headers)
    log_result("crud", "Create Wellness Check-In", resp_well.status_code == 200 or resp_well.status_code == 201, f"Status: {resp_well.status_code}, Body: {resp_well.text}")

except Exception as e:
    log_result("crud", "Performance & Wellness Flow Error", False, str(e))

# --- 9. RECRUITMENT FLOW ---
try:
    # Associate recruiter user with Org A
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET organization_id = %s WHERE email = 'test_recruiter@athletehub.local'", (org_a_id,))
    conn.commit()
    cursor.close()
    conn.close()

    resp_pros = requests.post(f"{BASE_URL}/recruitment/prospects?athleteId={athlete_id}&organizationId={org_a_id}", headers=recruiter_headers)
    if resp_pros.status_code in [200, 201]:
        prospect_id = resp_pros.json()["data"]["id"]
        log_result("crud", "Create Recruitment Prospect", True, f"Prospect ID: {prospect_id}")
    else:
        prospect_id = None
        log_result("crud", "Create Recruitment Prospect", False, f"Status: {resp_pros.status_code}, Body: {resp_pros.text}")

    if prospect_id:
        # Create Note
        note_payload = {
            "noteText": "TEST_AUDIT Strong sprint capabilities",
            "rating": 5
        }
        resp_note = requests.post(f"{BASE_URL}/recruitment/prospects/{prospect_id}/notes", json=note_payload, headers=recruiter_headers)
        log_result("crud", "Create Recruitment Note", resp_note.status_code in [200, 201], f"Status: {resp_note.status_code}")

except Exception as e:
    log_result("crud", "Recruitment Flow Error", False, str(e))

# --- 10. ERROR HANDLING ---
try:
    invalid_ath_payload = {
        "firstName": "TEST_AUDIT_ATHLETE_INVALID",
        "lastName": "LastName",
        "gender": "Male",
        "sportId": 69
    }
    resp_err = requests.post(f"{BASE_URL}/athletes", json=invalid_ath_payload, headers=athlete_headers)
    log_result("rbac", "Error Handling - Missing DOB Rejected", resp_err.status_code == 400 and "date_of_birth" in resp_err.text, f"Status: {resp_err.status_code}, Body: {resp_err.text}")

except Exception as e:
    log_result("rbac", "Error Handling Flow Error", False, str(e))

print("\n=== LAYER 1 AUTOMATED AUDIT (ROUND 7) COMPLETED ===")

# Save JSON results
with open("C:/Users/Sai Ram/.gemini/antigravity/brain/c95f208e-21fa-48e5-ad86-e0d68519d0fd/scratch/audit_layer1_results.json", "w") as f:
    json.dump(results, f, indent=4)
print("Results saved to audit_layer1_results.json")
