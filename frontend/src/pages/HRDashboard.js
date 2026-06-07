import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Standardize with axios to avoid any serifs package issues
const axiosInstance = axios;

const hrDashboardCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .hrd-root {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f8fafc;
    font-family: 'Inter', -apple-system, sans-serif;
    color: #0f172a;
  }

  /* NAV */
  .hrd-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 52px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  }

  .hrd-logo {
    font-size: 18px;
    font-weight: 700;
    color: #2563eb;
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;
  }

  .hrd-logo-dot {
    width: 8px;
    height: 8px;
    background: #2563eb;
    border-radius: 50%;
  }

  .hrd-logout-btn {
    background: transparent;
    color: #64748b;
    border: none;
    padding: 8px 14px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    outline: none;
  }

  .hrd-logout-btn:hover {
    color: #ef4444;
    background: #fef2f2;
  }

  .hrd-profile-nav-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border-radius: 9999px;
    cursor: pointer;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
    user-select: none;
  }
  .hrd-profile-nav-btn:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
  }
  .hrd-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    background: #2563eb;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 11.5px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }
  .hrd-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hrd-profile-name {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }
  @media (max-width: 768px) {
    .hrd-profile-name {
      display: none;
    }
    .hrd-profile-nav-btn {
      padding: 4px;
      background: transparent;
      border: none;
    }
  }

  .hrd-main {
    max-width: 1440px;
    width: 100%;
    margin: 16px auto;
    padding: 0 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  @media (max-width: 768px) {
    .hrd-main {
      margin: 16px auto;
      padding: 0 16px;
      gap: 16px;
    }
  }

  .hrd-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .hrd-title {
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  /* TABS */
  .hrd-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 12px;
  }

  @media (max-width: 640px) {
    .hrd-tabs {
      flex-direction: column;
      gap: 6px;
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  .hrd-tab {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 10px 18px;
    font-size: 13.5px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    outline: none;
  }

  .hrd-tab:hover {
    background: #f1f5f9;
    color: #334155;
  }

  .hrd-tab.active {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
    box-shadow: 0 2px 4px 0 rgba(37, 99, 235, 0.15);
  }

  /* CARDS */
  .hrd-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 24px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);
    overflow-x: auto;
  }

  @media (max-width: 640px) {
    .hrd-card {
      padding: 16px;
    }
  }

  /* SELECTOR */
  .hrd-select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .hrd-select {
    width: 100%;
    max-width: 400px;
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    background: #ffffff;
    outline: none;
    transition: border-color 0.2s;
  }

  .hrd-select:focus {
    border-color: #2563eb;
  }

  /* TABLE */
  .hrd-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    min-width: 650px;
  }

  .hrd-table th {
    background: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
    padding: 12px;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .hrd-table td {
    padding: 14px 12px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 13.5px;
    color: #334155;
    vertical-align: middle;
  }

  .hrd-table tr:hover {
    background-color: #fafbfd;
  }

  /* STATUS PILL */
  .hrd-status-pill {
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    display: inline-block;
    text-transform: capitalize;
    border: 1px solid transparent;
  }

  /* BUTTONS */
  .hrd-btn {
    background: #2563eb;
    color: #ffffff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    border: 1px solid #2563eb;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
    outline: none;
  }

  .hrd-btn:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }

  .hrd-btn:disabled {
    background: #e2e8f0;
    border-color: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
  }

  .hrd-btn-dark {
    background: #1e293b;
    border-color: #1e293b;
  }

  .hrd-btn-dark:hover {
    background: #0f172a;
    border-color: #0f172a;
  }

  .hrd-btn-success {
    background: #10b981;
    border-color: #10b981;
  }

  .hrd-btn-success:hover {
    background: #059669;
    border-color: #059669;
  }

  .hrd-btn-danger {
    background: #ef4444;
    color: #ffffff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    outline: none;
  }

  .hrd-btn-danger:hover {
    background: #dc2626;
    border-color: #dc2626;
  }

  .hrd-btn-danger:disabled {
    background: #fecaca;
    border-color: #fca5a5;
    color: #f87171;
    cursor: not-allowed;
    box-shadow: none;
  }

  .hrd-btn-secondary {
    background: #f8fafc;
    color: #475569;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    outline: none;
  }

  .hrd-btn-secondary:hover {
    background: #f1f5f9;
    color: #1e293b;
    border-color: #94a3b8;
  }

  .hrd-btn-secondary:disabled {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: #cbd5e1;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* FORMS */
  .hrd-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .hrd-form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .hrd-label {
    font-size: 13.5px;
    font-weight: 600;
    color: #334155;
  }

  .hrd-textarea {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    outline: none;
    resize: vertical;
    color: #0f172a;
    transition: border-color 0.2s;
  }

  .hrd-textarea:focus {
    border-color: #2563eb;
  }

  .hrd-input {
    width: 100%;
    max-width: 200px;
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    outline: none;
    color: #0f172a;
    transition: border-color 0.2s;
  }

  .hrd-input:focus {
    border-color: #2563eb;
  }

  /* LOADING OVERLAY */
  .hrd-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(1.5px);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .hrd-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #eff6ff;
    border-top: 3px solid #2563eb;
    border-radius: 50%;
    animation: hrdSpin 0.8s linear infinite;
  }

  @keyframes hrdSpin { to { transform: rotate(360deg); } }

  /* SCORECARD DETAILS */
  .hrd-score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }

  .hrd-score-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    text-align: center;
  }

  .hrd-score-label {
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
  }

  .hrd-score-value {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-top: 4px;
  }

  /* MODAL */
  .hrd-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.3);
    backdrop-filter: blur(2px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .hrd-modal {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-width: 580px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
    font-family: inherit;
  }

  .hrd-modal-close {
    position: absolute;
    top: 14px;
    right: 14px;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    width: 28px;
    height: 28px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .hrd-modal-close:hover {
    background: #e2e8f0;
    color: #334155;
  }

  /* NEW GLASSMORPHISM & WIDGET STYLES */
  .hrd-nav-menu {
    display: flex;
    gap: 6px;
    padding: 8px 32px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  .hrd-nav-menu::-webkit-scrollbar {
    display: none;
  }
  .hrd-nav-item {
    font-size: 12.5px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
    transition: all 0.2s;
    background: transparent;
    border: none;
    outline: none;
  }
  .hrd-nav-item:hover {
    color: #334155;
    background: #f1f5f9;
  }
  .hrd-nav-item.active {
    color: #2563eb;
    background: #eff6ff;
  }

  .hrd-greeting-section {
    margin-bottom: 2px;
  }
  .hrd-greeting-title {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  .hrd-greeting-subtitle {
    font-size: 13px;
    color: #64748b;
    margin-top: 2px;
  }

  .hrd-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 4px;
  }
  @media (max-width: 1024px) {
    .hrd-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 768px) {
    .hrd-grid {
      grid-template-columns: 1fr;
    }
  }

  .hrd-widget-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.01);
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 255px;
    position: relative;
    overflow: hidden;
  }

  .hrd-quote-card {
    background-size: cover;
    background-position: center;
    color: #ffffff;
    border: none;
    justify-content: flex-end;
  }
  .hrd-quote-content {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 10px;
    padding: 12px;
  }
  .hrd-quote-text {
    font-size: 13.5px;
    font-weight: 500;
    line-height: 1.45;
    margin: 0;
    font-style: italic;
  }
  .hrd-quote-author {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 4px;
    display: block;
    font-weight: 600;
  }

  .hrd-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;
    flex: 1;
    max-height: 125px;
    padding-right: 4px;
  }
  .hrd-list::-webkit-scrollbar {
    width: 4px;
  }
  .hrd-list::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 2px;
  }
  .hrd-list-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 12px;
  }
  .hrd-list-item.system {
    border-left: 3px solid #3b82f6;
  }
  .hrd-list-item.reminder {
    border-left: 3px solid #eab308;
  }
  .hrd-list-item-title {
    font-weight: 600;
    color: #1e293b;
  }
  .hrd-list-item-desc {
    color: #475569;
    line-height: 1.35;
  }

  .hrd-task-form {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px;
    margin-top: auto;
  }
  .hrd-task-input {
    width: 100%;
    padding: 5px 8px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 11.5px;
    outline: none;
  }
  .hrd-task-date-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .hrd-task-date-input {
    flex: 1;
    padding: 3px 5px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 11px;
    outline: none;
  }

  .hrd-metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 6px;
  }
  .hrd-metric-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .hrd-metric-label {
    font-size: 12px;
    color: #475569;
    font-weight: 500;
  }
  .hrd-metric-value {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
  }
  .hrd-progress-bar-bg {
    width: 100%;
    height: 5px;
    background: #e2e8f0;
    border-radius: 2.5px;
    overflow: hidden;
    margin-top: 3px;
  }
  .hrd-progress-bar-fill {
    height: 100%;
    background: #2563eb;
    border-radius: 2.5px;
  }

  .hrd-placeholder-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    width: 100%;
  }
  .hrd-placeholder-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(226, 232, 240, 0.8);
    border-radius: 12px;
    padding: 40px;
    max-width: 480px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .hrd-placeholder-card h3 {
    font-size: 16.5px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  .hrd-placeholder-card p {
    font-size: 13.5px;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }
  .hrd-coming-soon-badge {
    background: #eff6ff;
    color: #2563eb;
    font-size: 11.5px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 9999px;
  }

  /* Profile Modal Styles */
  .hrd-profile-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .hrd-profile-modal-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    animation: hrdModalFade 0.25s ease-out;
  }
  @keyframes hrdModalFade {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .hrd-profile-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e2e8f0;
  }
  .hrd-profile-modal-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  .hrd-profile-modal-close {
    background: none;
    border: none;
    color: #64748b;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    transition: color 0.2s;
  }
  .hrd-profile-modal-close:hover {
    color: #0f172a;
  }
  .hrd-profile-modal-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .hrd-profile-image-upload-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .hrd-profile-avatar-preview {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #f1f5f9;
    border: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: #2563eb;
    overflow: hidden;
    position: relative;
  }
  .hrd-profile-avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hrd-file-input-label {
    font-size: 11.5px;
    font-weight: 600;
    color: #2563eb;
    cursor: pointer;
    padding: 5px 10px;
    background: #eff6ff;
    border-radius: 6px;
    transition: all 0.2s;
  }
  .hrd-file-input-label:hover {
    background: #dbeafe;
  }
  .hrd-profile-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .hrd-profile-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .hrd-profile-field label {
    font-size: 11.5px;
    font-weight: 600;
    color: #64748b;
  }
  .hrd-profile-input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-family: inherit;
    font-size: 13px;
    outline: none;
    color: #0f172a;
    transition: border-color 0.2s;
  }
  .hrd-profile-input:focus {
    border-color: #2563eb;
  }
  .hrd-profile-input:disabled {
    background: #f8fafc;
    color: #64748b;
    cursor: not-allowed;
  }
  .hrd-profile-submit-btn {
    background: #2563eb;
    color: #ffffff;
    border: none;
    padding: 9px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .hrd-profile-submit-btn:hover {
    background: #1d4ed8;
  }
  .hrd-profile-submit-btn:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }
  .hrd-profile-logout-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 6px 0;
  }
  .hrd-profile-logout-btn {
    background: #fef2f2;
    color: #ef4444;
    border: 1px solid #fee2e2;
    padding: 8px;
    border-radius: 6px;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }
  .hrd-profile-logout-btn:hover {
    background: #fee2e2;
  }

  /* Recruitment Sidebar and Main listings */
  .hrd-recruitment-layout {
    display: flex;
    gap: 20px;
    width: 100%;
    align-items: flex-start;
  }
  .hrd-job-sidebar {
    width: 320px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex-shrink: 0;
    position: sticky;
    top: 68px;
  }
  .hrd-job-main-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .hrd-job-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 18px 20px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.2s;
  }
  .hrd-job-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .hrd-job-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .hrd-job-card-title-group {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
    flex: 1;
  }
  .hrd-job-card-title {
    font-size: 15.5px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  .hrd-job-card-arrow {
    font-size: 18px;
    color: #64748b;
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }
  .hrd-job-card-arrow.expanded {
    transform: rotate(90deg);
  }
  .hrd-job-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: #64748b;
    margin-top: 2px;
  }
  .hrd-job-card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
    margin-top: 4px;
  }
  .hrd-job-card-details {
    padding: 8px 0 4px 0;
    border-top: 1px dashed #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .hrd-job-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
  }
  .hrd-job-details-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .hrd-job-details-label {
    font-size: 10px;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
  }
  .hrd-job-details-value {
    font-size: 12.5px;
    color: #0f172a;
    font-weight: 500;
  }
  .hrd-job-desc-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .hrd-job-desc-title {
    font-size: 12.5px;
    font-weight: 600;
    color: #334155;
  }
  .hrd-job-desc-text {
    font-size: 13px;
    color: #475569;
    line-height: 1.5;
    margin: 0;
    white-space: pre-line;
  }

  /* Candidate Management Split Layout */
  .hrd-candidate-layout {
    display: flex;
    gap: 20px;
    width: 100%;
    align-items: flex-start;
  }
  .hrd-candidate-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .hrd-candidate-sidebar {
    width: 280px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex-shrink: 0;
    position: sticky;
    top: 68px;
  }
  .hrd-candidate-active-job-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px 20px;
  }
  .hrd-back-to-jobs-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: #2563eb;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
    outline: none;
  }
  .hrd-back-to-jobs-btn:hover {
    color: #1d4ed8;
  }

  .hrd-job-card-header-badge-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    .hrd-recruitment-layout {
      flex-direction: column;
      align-items: stretch;
    }
    .hrd-job-sidebar {
      width: 100%;
      position: static;
    }
    .hrd-candidate-layout {
      flex-direction: column-reverse;
      align-items: stretch;
    }
    .hrd-candidate-sidebar {
      width: 100%;
      position: static;
    }
  }

  @media (max-width: 640px) {
    .hrd-job-card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .hrd-job-card-header-badge-group {
      align-self: flex-end;
    }
    .hrd-candidate-active-job-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
`;

function parseResult(text) {
  const sections = { strengths: [], weaknesses: [], verdict: "", metrics: [] };
  if (!text) return sections;

  const strengthsMatch = text.match(/Strengths:\s*([\s\S]*?)(?=Weaknesses:|Verdict:|Clarity:|$)/i);
  const weaknessesMatch = text.match(/Weaknesses:\s*([\s\S]*?)(?=Strengths:|Verdict:|Clarity:|$)/i);
  const verdictMatch = text.match(/Verdict:\s*([^\n]+)/i);

  if (strengthsMatch)
    sections.strengths = strengthsMatch[1].split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  if (weaknessesMatch)
    sections.weaknesses = weaknessesMatch[1].split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  if (verdictMatch)
    sections.verdict = verdictMatch[1].trim().toUpperCase();

  const scoreLines = text.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/gm) || [];
  sections.metrics = scoreLines.map(line => {
    const m = line.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
    return { label: m[1].trim(), score: parseFloat(m[2]), total: parseFloat(m[3]) };
  });

  return sections;
}

const drawerStyles = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.35)", backdropFilter: "blur(1.5px)", zIndex: 300 },
  drawer: {
    position: "fixed", top: 0, right: 0,
    width: "100%", maxWidth: "420px", height: "100vh",
    background: "#fff", zIndex: 301,
    display: "flex", flexDirection: "column",
    boxShadow: "-8px 0 32px rgba(0,0,0,0.06)",
    fontFamily: "Inter, sans-serif",
  },
  panelHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "18px 20px", background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0", flexShrink: 0,
  },
  panelTitle: { fontWeight: 700, fontSize: 16, color: "#0f172a", margin: 0 },
  panelSub: { fontSize: 11, color: "#64748b", marginTop: 3, margin: 0 },
  closeBtn: {
    background: "#f1f5f9", color: "#64748b", border: "none",
    width: 28, height: 28, cursor: "pointer",
    fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "50%", transition: "all 0.2s"
  },
  panelBody: {
    flex: 1, overflowY: "auto", padding: 16,
    display: "flex", flexDirection: "column", gap: 12,
  },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  avatarAI: {
    width: 28, height: 28, borderRadius: "50%",
    background: "#eff6ff", border: "1px solid #bfdbfe",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700, color: "#2563eb", flexShrink: 0,
  },
  avatarUser: {
    width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700, color: "#475569", flexShrink: 0,
  },
  bubble: { maxWidth: "75%", padding: "10px 14px", fontSize: 13 },
};

function ConversationPanel({ chatId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setError(null);

    axiosInstance.get(`${process.env.REACT_APP_BACKEND_URL}/api/chat/history/${chatId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => {
        const msgs = Array.isArray(res.data) ? res.data : (res.data.messages || []);
        setMessages(msgs);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [chatId]);

  return (
    <>
      <div onClick={onClose} style={drawerStyles.backdrop} />
      <div style={drawerStyles.drawer}>
        <div style={drawerStyles.panelHeader}>
          <div>
            <p style={drawerStyles.panelTitle}>Interview Chat Log</p>
            <p style={drawerStyles.panelSub}>Chat ID: {chatId}</p>
          </div>
          <button onClick={onClose} style={drawerStyles.closeBtn}>✕</button>
        </div>
        <div style={drawerStyles.panelBody}>
          {loading && <p style={{ textAlign: "center", color: "#888", fontSize: 13 }}>Loading conversation...</p>}
          {error && <p style={{ color: "#ef4444", fontSize: 13 }}>Failed to load chat history.</p>}
          {!loading && !error && messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} style={{ ...drawerStyles.msgRow, justifyContent: isUser ? "flex-end" : "flex-start" }}>
                {!isUser && <div style={drawerStyles.avatarAI}>AI</div>}
                <div style={{
                  ...drawerStyles.bubble,
                  background: isUser ? "#2563eb" : "#f1f5f9",
                  color: isUser ? "#fff" : "#0f172a",
                  borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                }}>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{msg.content}</p>
                </div>
                {isUser && <div style={drawerStyles.avatarUser}>U</div>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map(x => x[0]).join("").toUpperCase().substring(0, 2);
};

const thoughtsList = [
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", bg: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", bg: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh", bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80" },
  { text: "Opportunities don't happen, you create them.", author: "Chris Grosser", bg: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", bg: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", bg: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80" }
];

function HRDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard"); // "dashboard", "recruitment", etc.
  const [userName, setUserName] = useState("HR Manager");
  const [userImage, setUserImage] = useState("");
  const [userContact, setUserContact] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);

  // States for Editing in the modal
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("board"); // "board", "post-job", "shortlist"
  const [viewingJobCandidates, setViewingJobCandidates] = useState(false);
  const [expandedJobIds, setExpandedJobIds] = useState([]);

  const [customTasks, setCustomTasks] = useState(() => {
    const saved = localStorage.getItem("hrd_custom_tasks");
    return saved ? JSON.parse(saved) : [
      { id: "t1", text: "Verify onboarding documents for new hires", completed: false, reminderDate: "" },
      { id: "t2", text: "Update payroll spreadsheet for June", completed: false, reminderDate: "" },
      { id: "t3", text: "Prepare training materials for engineering team", completed: false, reminderDate: "" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("hrd_custom_tasks", JSON.stringify(customTasks));
  }, [customTasks]);

  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskHasReminder, setNewTaskHasReminder] = useState(false);
  const [newTaskReminderDate, setNewTaskReminderDate] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed) {
          if (parsed.name) setUserName(parsed.name);
          if (parsed.image) setUserImage(parsed.image);
          if (parsed.contact) setUserContact(parsed.contact);
          if (parsed.email) setUserEmail(parsed.email);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (showProfileModal) {
      setEditName(userName);
      setEditContact(userContact || "");
      setEditPhotoFile(null);
      setEditPhotoPreview(userImage || "");
      setProfileMessage("");
      setProfileError("");
    }
  }, [showProfileModal, userName, userContact, userImage]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
      reminderDate: newTaskHasReminder ? newTaskReminderDate : ""
    };
    setCustomTasks([newTask, ...customTasks]);
    setNewTaskText("");
    setNewTaskHasReminder(false);
    setNewTaskReminderDate("");
  };

  const handleToggleTask = (taskId) => {
    setCustomTasks(customTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  // Job filters, sorts, and search states
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [jobSortOrder, setJobSortOrder] = useState("desc"); // "desc" or "asc"
  const [jobExpFilter, setJobExpFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [jobDomainFilter, setJobDomainFilter] = useState("");

  // Candidate filters, sorts, and search states
  const [candidateSearchQuery, setCandidateSearchQuery] = useState("");
  const [candidateStatusFilter, setCandidateStatusFilter] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [candidateResultFilter, setCandidateResultFilter] = useState("");
  const [candidateSortKey, setCandidateSortKey] = useState("");

  // Post Job form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEducation, setNewEducation] = useState("Bachelor's Degree");
  const [newLocation, setNewLocation] = useState("Remote");
  const [newJobType, setNewJobType] = useState("Full-time");
  const [newExpLevel, setNewExpLevel] = useState("Entry Level");
  const [newDomain, setNewDomain] = useState("Software Engineering");
  const [newSkills, setNewSkills] = useState("");
  const [newLastDate, setNewLastDate] = useState("");
  const [submittingJob, setSubmittingJob] = useState(false);

  // AI Shortlisting State
  const [shortlistCount, setShortlistCount] = useState(1);
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Modal / Drawer state
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewChatId, setViewChatId] = useState(null);
  const [schedulingEmails, setSchedulingEmails] = useState(null); // null = closed, [] = bulk, [email] = individual
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchJobApplications(selectedJobId);
    } else {
      setApplications([]);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/jobs/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setJobs(res.data);
      if (res.data.length > 0) {
        setSelectedJobId(res.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplications = async (jobId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/hr/candidates/?job_id=${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    if (!window.confirm(`Are you sure you want to delete the job posting "${job.title}"? This will permanently delete all associated candidate applications and scorecards.`)) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/jobs/delete/${jobId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Job deleted successfully!");
      const updatedJobs = jobs.filter(j => j.id !== jobId);
      setJobs(updatedJobs);
      if (updatedJobs.length > 0) {
        setSelectedJobId(updatedJobs[0].id);
      } else {
        setSelectedJobId("");
      }
    } catch (err) {
      alert("Failed to delete job.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const appCleared = (app) => {
    return app.status === "interview_cleared";
  };

  const appNotCleared = (app) => {
    return app.status === "rejected" && app.reason === "Interview not cleared";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setProfileError("Name is required");
      return;
    }
    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      formData.append("contact", editContact.trim());
      if (editPhotoFile) {
        formData.append("image", editPhotoFile);
      }

      const token = localStorage.getItem("token");
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

      const response = await axiosInstance.post(`${backendUrl}/api/users/profile/update-hr/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data && response.data.user) {
        const updatedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setUserName(updatedUser.name);
        setUserImage(updatedUser.image || "");
        setUserContact(updatedUser.contact || "");
        setUserEmail(updatedUser.email || "");

        setProfileMessage("Profile updated successfully!");
        setTimeout(() => {
          setShowProfileModal(false);
        }, 1200);
      } else {
        setProfileError("Failed to update profile details.");
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || "An error occurred";
      setProfileError(errMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    setSubmittingJob(true);
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/jobs/create/`,
        {
          title: newTitle,
          description: newDesc,
          education: newEducation,
          location: newLocation,
          job_type: newJobType,
          experience_level: newExpLevel,
          domain: newDomain,
          skills: newSkills,
          last_date: newLastDate || null
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Job posted successfully!");
      setNewTitle("");
      setNewDesc("");
      setNewEducation("Bachelor's Degree");
      setNewLocation("Remote");
      setNewJobType("Full-time");
      setNewExpLevel("Entry Level");
      setNewDomain("Software Engineering");
      setNewSkills("");
      setNewLastDate("");
      setActiveTab("board");
      setJobs([res.data.job, ...jobs]);
      setSelectedJobId(res.data.job.id);
    } catch (err) {
      alert("Error posting job.");
    } finally {
      setSubmittingJob(false);
    }
  };

  const submitSchedule = async () => {
    if (!scheduleStart || !scheduleEnd) return;

    if (new Date(scheduleStart) < new Date()) {
      alert("Start date & time cannot be in the past.");
      return;
    }

    if (new Date(scheduleEnd) <= new Date(scheduleStart)) {
      alert("End date & time must be after the start date & time.");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/hr/schedule/`,
        {
          job_id: selectedJobId,
          emails: schedulingEmails,
          interview_start: new Date(scheduleStart).toISOString(),
          interview_end: new Date(scheduleEnd).toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Interviews scheduled successfully!");
      setSchedulingEmails(null);
      setScheduleStart("");
      setScheduleEnd("");
      fetchJobApplications(selectedJobId);
    } catch (err) {
      alert(err.response?.data?.error || "Error scheduling interview.");
      setLoading(false);
    }
  };

  const handleCancelInterview = async (app) => {
    if (!window.confirm(`Are you sure you want to cancel the scheduled interview for ${app.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/hr/cancel/`,
        {
          job_id: selectedJobId,
          email: app.email,
          application_id: app.id
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Interview cancelled successfully!");
      fetchJobApplications(selectedJobId);
    } catch (err) {
      alert(err.response?.data?.error || "Error cancelling interview.");
      setLoading(false);
    }
  };

  const handleCancelAllInterviews = async () => {
    const scheduledCount = applications.filter(app => app.status === "interview_scheduled").length;
    if (scheduledCount === 0) return;

    if (!window.confirm(`Are you sure you want to cancel the scheduled interviews for all ${scheduledCount} candidates?`)) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/hr/cancel/`,
        {
          job_id: selectedJobId,
          cancel_all: true
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("All scheduled interviews cancelled successfully!");
      fetchJobApplications(selectedJobId);
    } catch (err) {
      alert(err.response?.data?.error || "Error cancelling interviews.");
      setLoading(false);
    }
  };

  const handleRunAIShortlist = async (e) => {
    e.preventDefault();
    if (!selectedJobId || shortlistCount < 1) return;

    setShortlistLoading(true);
    setRecommendations([]);

    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/hr/shortlist/`,
        { job_id: selectedJobId, count: shortlistCount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRecommendations(res.data.recommendations);
    } catch (err) {
      alert(err.response?.data?.error || "AI Shortlist failed.");
    } finally {
      setShortlistLoading(false);
    }
  };

  const handleConfirmShortlist = async () => {
    if (recommendations.length === 0) return;
    const emails = recommendations.map(r => r.email);

    try {
      setShortlistLoading(true);
      await axiosInstance.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/hr/confirm/`,
        { job_id: selectedJobId, emails },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Recommended shortlist confirmed!");
      setRecommendations([]);
      setShortlistCount(1);
      setActiveTab("board");
      fetchJobApplications(selectedJobId);
    } catch (err) {
      alert("Error confirming shortlist.");
    } finally {
      setShortlistLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "applied": return { background: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" };
      case "shortlisted": return { background: "#f5f3ff", color: "#5b21b6", borderColor: "#ddd6fe" }; // Purple
      case "interview_scheduled": return { background: "#fff7ed", color: "#c2410c", borderColor: "#ffedd5" }; // Orange
      case "interview_completed": return { background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }; // Green
      case "interview_cleared": return { background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }; // Green
      case "rejected": return { background: "#fef2f2", color: "#991b1b", borderColor: "#fca5a5" }; // Red
      default: return { background: "#f1f5f9", color: "#475569", borderColor: "#cbd5e1" };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "applied": return "Applied";
      case "shortlisted": return "Shortlisted";
      case "interview_scheduled": return "Interview Scheduled";
      case "interview_completed": return "Interview Completed";
      case "interview_cleared": return "Interview Cleared";
      case "rejected": return "Rejected";
      default: return status.replace("_", " ");
    }
  };

  // Compute filtered & sorted jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !jobSearchQuery ||
      job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(jobSearchQuery.toLowerCase()));
    const matchesExp = !jobExpFilter || job.experience_level === jobExpFilter;
    const matchesType = !jobTypeFilter || job.job_type === jobTypeFilter;
    const matchesDomain = !jobDomainFilter || job.domain === jobDomainFilter;
    return matchesSearch && matchesExp && matchesType && matchesDomain;
  }).sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return jobSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Compute filtered & sorted candidate applications
  const filteredApplications = applications.filter(app => {
    const query = candidateSearchQuery.toLowerCase();
    const matchesSearch = !query ||
      (app.name && app.name.toLowerCase().includes(query)) ||
      (app.email && app.email.toLowerCase().includes(query)) ||
      (app.skills && app.skills.some(s => s.toLowerCase().includes(query)));

    const matchesStatus = !candidateStatusFilter || app.status === candidateStatusFilter;

    let matchesResult = true;
    if (candidateResultFilter === "cleared") {
      matchesResult = appCleared(app);
    } else if (candidateResultFilter === "not_cleared") {
      matchesResult = appNotCleared(app);
    } else if (candidateResultFilter === "shortlisted") {
      matchesResult = app.status === "shortlisted";
    } else if (candidateResultFilter === "applied") {
      matchesResult = app.status === "applied";
    } else if (candidateResultFilter === "rejected") {
      matchesResult = app.status === "rejected";
    } else if (candidateResultFilter === "scheduled") {
      matchesResult = app.status === "interview_scheduled";
    }

    return matchesSearch && matchesStatus && matchesResult;
  }).sort((a, b) => {
    if (candidateSortKey === "cgpa-desc") {
      return parseFloat(b.cgpa || 0) - parseFloat(a.cgpa || 0);
    } else if (candidateSortKey === "cgpa-asc") {
      return parseFloat(a.cgpa || 0) - parseFloat(b.cgpa || 0);
    } else if (candidateSortKey === "status-asc") {
      return (a.status || "").localeCompare(b.status || "");
    } else if (candidateSortKey === "status-desc") {
      return (b.status || "").localeCompare(a.status || "");
    } else if (candidateSortKey === "name-asc") {
      return (a.name || "").localeCompare(b.name || "");
    }
    return 0;
  });

  // Sync selected job selection if filtered out
  useEffect(() => {
    if (filteredJobs.length > 0 && !filteredJobs.some(j => j.id === selectedJobId)) {
      setSelectedJobId(filteredJobs[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobSearchQuery, jobSortOrder, jobExpFilter, jobTypeFilter, jobDomainFilter, jobs]);

  const handleCloseChat = useCallback(() => setViewChatId(null), []);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "recruitment", label: "Recruitment" },
    { id: "onboarding", label: "Onboarding" },
    { id: "document", label: "Document" },
    { id: "training", label: "Training & Learning" },
    { id: "asset", label: "Asset" },
    { id: "employee", label: "Employee" },
    { id: "attendance", label: "Attendance" },
    { id: "leave", label: "Leave" },
    { id: "payroll", label: "Payroll" },
    { id: "performance", label: "Performance" },
    { id: "offboarding", label: "Offboarding" },
    { id: "query", label: "Query" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hrDashboardCSS }} />
      <div className="hrd-root">
        {shortlistLoading && (
          <div className="hrd-overlay">
            <div className="hrd-spinner" />
            <p style={{ fontWeight: "bold", fontSize: 14, color: "#334155", textAlign: "center" }}>
              Matching applicant records...
              <br />
              Running AI ranking against Job Description...
            </p>
          </div>
        )}

        {viewChatId && (
          <ConversationPanel chatId={viewChatId} onClose={handleCloseChat} />
        )}

        {showProfileModal && (
          <div className="hrd-profile-modal-overlay">
            <div className="hrd-profile-modal-card">
              <div className="hrd-profile-modal-header">
                <h3 className="hrd-profile-modal-title">HR Recruiter Profile</h3>
                <button className="hrd-profile-modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
              </div>
              <div className="hrd-profile-modal-body">
                <form onSubmit={handleSaveProfile} className="hrd-profile-form">
                  <div className="hrd-profile-image-upload-wrapper">
                    <div className="hrd-profile-avatar-preview">
                      {editPhotoPreview ? (
                        <img src={editPhotoPreview} alt="Preview" />
                      ) : (
                        getInitials(editName || "HR")
                      )}
                    </div>
                    <label className="hrd-file-input-label">
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setEditPhotoFile(file);
                            setEditPhotoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="hrd-profile-field">
                    <label>Email Address</label>
                    <input
                      type="text"
                      className="hrd-profile-input"
                      value={userEmail}
                      disabled
                    />
                  </div>

                  <div className="hrd-profile-field">
                    <label>Name</label>
                    <input
                      type="text"
                      className="hrd-profile-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="HR Manager Name"
                      required
                    />
                  </div>

                  <div className="hrd-profile-field">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      className="hrd-profile-input"
                      value={editContact}
                      onChange={(e) => setEditContact(e.target.value)}
                      placeholder="Contact Number"
                    />
                  </div>

                  {profileMessage && (
                    <p style={{ color: "#10b981", fontSize: 13, margin: "4px 0", fontWeight: "600", textAlign: "center" }}>
                      {profileMessage}
                    </p>
                  )}
                  {profileError && (
                    <p style={{ color: "#ef4444", fontSize: 13, margin: "4px 0", fontWeight: "600", textAlign: "center" }}>
                      {profileError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="hrd-profile-submit-btn"
                    disabled={savingProfile}
                  >
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </form>

                <div className="hrd-profile-logout-divider" />
                <button
                  type="button"
                  className="hrd-profile-logout-btn"
                  onClick={() => {
                    setShowProfileModal(false);
                    handleLogout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        <nav className="hrd-nav">
          <div className="hrd-logo">
            <span className="hrd-logo-dot" />
            HireScope Recruiter
          </div>
          <div className="hrd-profile-nav-btn" onClick={() => setShowProfileModal(true)}>
            <div className="hrd-avatar">
              {userImage ? (
                <img src={userImage} alt="Profile" className="hrd-avatar-img" />
              ) : (
                getInitials(userName)
              )}
            </div>
            <span className="hrd-profile-name">{userName}</span>
          </div>
        </nav>

        {/* 13 Nav bar items */}
        <div className="hrd-nav-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`hrd-nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main className="hrd-main">
          {/* DASHBOARD TAB (6 Boxes Grid) */}
          {activeNav === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="hrd-greeting-section">
                <h1 className="hrd-greeting-title">
                  {(() => {
                    const hr = new Date().getHours();
                    if (hr >= 5 && hr < 12) return "Good Morning";
                    if (hr >= 12 && hr < 17) return "Good Afternoon";
                    if (hr >= 17 && hr < 22) return "Good Evening";
                    return "Good Night";
                  })()}, {userName}
                </h1>
                <p className="hrd-greeting-subtitle">Here is your operational overview for today.</p>
              </div>

              <div className="hrd-grid">
                {/* Box 1: Thoughts of the Day */}
                {(() => {
                  const currentThought = thoughtsList[new Date().getDate() % thoughtsList.length];
                  return (
                    <div 
                      className="hrd-widget-card hrd-quote-card"
                      style={{
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.65)), url(${currentThought.bg})`
                      }}
                    >
                      <div className="hrd-quote-content">
                        <p className="hrd-quote-text">
                          "{currentThought.text}"
                        </p>
                        <span className="hrd-quote-author">
                          — {currentThought.author}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Box 2: Tasks */}
                <div className="hrd-widget-card">
                  <h3 className="hrd-label" style={{ margin: 0, fontSize: "14px" }}>System & Custom Tasks</h3>
                  <div className="hrd-list">
                    {(() => {
                      const tasks = [];
                      const now = new Date();
                      jobs.forEach(job => {
                        if (job.last_date && new Date(job.last_date) < now) {
                          tasks.push({
                            id: `auto-closed-${job.id}`,
                            text: `Application has now closed for the "${job.title}" posting. Kindly shortlist the candidates.`,
                            isSystem: true
                          });
                        }
                      });

                      const allTasks = [...tasks, ...customTasks];
                      if (allTasks.length === 0) {
                        return <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: "20px 0" }}>No active tasks today.</p>;
                      }

                      return allTasks.map(t => (
                        <div key={t.id} className={`hrd-list-item ${t.isSystem ? 'system' : ''}`}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            {!t.isSystem && (
                              <input
                                type="checkbox"
                                checked={t.completed}
                                onChange={() => handleToggleTask(t.id)}
                                style={{ marginTop: "3px", cursor: "pointer" }}
                              />
                            )}
                            <div className="hrd-list-item-desc" style={{ textDecoration: t.completed ? "line-through" : "none" }}>
                              {t.text}
                            </div>
                          </div>
                          {t.reminderDate && (
                            <div style={{ fontSize: "10.5px", color: "#eab308", fontWeight: "600", marginTop: "4px" }}>
                              🔔 Reminder: {new Date(t.reminderDate).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </div>

                  <form onSubmit={handleAddTask} className="hrd-task-form">
                    <input
                      type="text"
                      className="hrd-task-input"
                      placeholder="Add custom task..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                    />
                    <div className="hrd-task-date-row">
                      <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#475569", cursor: "pointer", userSelect: "none" }}>
                        <input
                          type="checkbox"
                          checked={newTaskHasReminder}
                          onChange={(e) => setNewTaskHasReminder(e.target.checked)}
                        />
                        Set Reminder
                      </label>
                      {newTaskHasReminder && (
                        <input
                          type="datetime-local"
                          className="hrd-task-date-input"
                          value={newTaskReminderDate}
                          onChange={(e) => setNewTaskReminderDate(e.target.value)}
                          min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                        />
                      )}
                    </div>
                    <button type="submit" className="hrd-btn" style={{ padding: "4px 10px", fontSize: "11px", alignSelf: "flex-end" }}>
                      Add Task
                    </button>
                  </form>
                </div>

                {/* Box 3: Reminders */}
                <div className="hrd-widget-card">
                  <h3 className="hrd-label" style={{ margin: 0, fontSize: "14px" }}>Active Reminders</h3>
                  <div className="hrd-list" style={{ maxHeight: "280px" }}>
                    {(() => {
                      const list = [];

                      // 1. Scheduled interviews from applications
                      applications.forEach(app => {
                        if (app.status === "interview_scheduled" && app.interview_start) {
                          list.push({
                            id: `interview-${app.id}`,
                            title: `Interview: ${app.name}`,
                            details: `Start: ${new Date(app.interview_start).toLocaleString()}`,
                            date: new Date(app.interview_start)
                          });
                        }
                      });

                      // 2. Custom reminders from tasks
                      customTasks.forEach(task => {
                        if (task.reminderDate && !task.completed) {
                          list.push({
                            id: `custom-rem-${task.id}`,
                            title: `Task Reminder`,
                            details: task.text,
                            date: new Date(task.reminderDate)
                          });
                        }
                      });

                      // Sort by date ascending
                      list.sort((a, b) => a.date - b.date);

                      if (list.length === 0) {
                        return <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: "40px 0" }}>No upcoming reminders.</p>;
                      }

                      return list.map(item => (
                        <div key={item.id} className="hrd-list-item reminder">
                          <span className="hrd-list-item-title">{item.title}</span>
                          <span className="hrd-list-item-desc">{item.details}</span>
                          <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>
                            📅 {item.date.toLocaleString()}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Box 4: Employee Attendance */}
                <div className="hrd-widget-card">
                  <h3 className="hrd-label" style={{ margin: 0, fontSize: "14px" }}>Employee Attendance Analytics</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <div className="hrd-metric-row">
                        <span className="hrd-metric-label">Present Today</span>
                        <span className="hrd-metric-value">91.1% (41/45)</span>
                      </div>
                      <div className="hrd-progress-bar-bg">
                        <div className="hrd-progress-bar-fill" style={{ width: "91.1%", background: "#10b981" }} />
                      </div>
                    </div>
                    <div>
                      <div className="hrd-metric-row">
                        <span className="hrd-metric-label">On Leave</span>
                        <span className="hrd-metric-value">6.7% (3/45)</span>
                      </div>
                      <div className="hrd-progress-bar-bg">
                        <div className="hrd-progress-bar-fill" style={{ width: "6.7%", background: "#3b82f6" }} />
                      </div>
                    </div>
                    <div>
                      <div className="hrd-metric-row">
                        <span className="hrd-metric-label">Absent</span>
                        <span className="hrd-metric-value">2.2% (1/45)</span>
                      </div>
                      <div className="hrd-progress-bar-bg">
                        <div className="hrd-progress-bar-fill" style={{ width: "2.2%", background: "#ef4444" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 5: Job Posting Analytics */}
                <div className="hrd-widget-card">
                  <h3 className="hrd-label" style={{ margin: 0, fontSize: "14px" }}>Job Posting Analytics</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, justifyContent: "center" }}>
                    <div className="hrd-metric-row">
                      <span className="hrd-metric-label">Total Job Postings</span>
                      <span className="hrd-metric-value" style={{ fontSize: "18px" }}>{jobs.length}</span>
                    </div>
                    <div className="hrd-metric-row">
                      <span className="hrd-metric-label">Applications Open</span>
                      <span className="hrd-metric-value" style={{ color: "#10b981" }}>
                        {(() => {
                          const now = new Date();
                          return jobs.filter(j => !j.last_date || new Date(j.last_date) >= now).length;
                        })()}
                      </span>
                    </div>
                    <div className="hrd-metric-row">
                      <span className="hrd-metric-label">Applications Closed</span>
                      <span className="hrd-metric-value" style={{ color: "#ef4444" }}>
                        {(() => {
                          const now = new Date();
                          return jobs.filter(j => j.last_date && new Date(j.last_date) < now).length;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Box 6: Queries Analytics */}
                <div className="hrd-widget-card">
                  <h3 className="hrd-label" style={{ margin: 0, fontSize: "14px" }}>Helpdesk Queries Analytics</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, justifyContent: "center" }}>
                    <div className="hrd-metric-row">
                      <span className="hrd-metric-label">Total Queries Received</span>
                      <span className="hrd-metric-value" style={{ fontSize: "18px" }}>18</span>
                    </div>
                    <div className="hrd-metric-row">
                      <span className="hrd-metric-label">Resolved Queries</span>
                      <span className="hrd-metric-value" style={{ color: "#10b981" }}>14</span>
                    </div>
                    <div className="hrd-metric-row">
                      <span className="hrd-metric-label">Pending Response</span>
                      <span className="hrd-metric-value" style={{ color: "#eab308" }}>4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RECRUITMENT TAB (Moving existing control panel) */}
          {activeNav === "recruitment" && (
            <>
              <div className="hrd-title-row">
                <h1 className="hrd-title">Recruitment Control Panel</h1>
              </div>

              <div className="hrd-tabs">
                <button
                  className={`hrd-tab ${activeTab === "board" ? "active" : ""}`}
                  onClick={() => setActiveTab("board")}
                >
                  Job Board Listings
                </button>
                <button
                  className={`hrd-tab ${activeTab === "post-job" ? "active" : ""}`}
                  onClick={() => setActiveTab("post-job")}
                >
                  Post a Job
                </button>
                <button
                  className={`hrd-tab ${activeTab === "shortlist" ? "active" : ""}`}
                  onClick={() => setActiveTab("shortlist")}
                >
                  AI Screening Tool
                </button>
              </div>

              {/* TAB 1: APPLICATIONS BOARD */}
              {activeTab === "board" && (
                !viewingJobCandidates ? (
                  <div className="hrd-recruitment-layout">
                    {/* Left Sidebar: Select Active Job Posting filters and list */}
                    <aside className="hrd-job-sidebar">
                      <h3 className="hrd-label" style={{ fontSize: "14px", margin: 0, borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                        Select Active Job
                      </h3>

                      <div className="hrd-form-group" style={{ gap: "4px" }}>
                        <label className="hrd-label" style={{ fontSize: "11px", color: "#64748b" }}>Search Jobs</label>
                        <input
                          type="text"
                          className="hrd-input"
                          style={{ maxWidth: "100%", padding: "6px 10px", fontSize: "12px" }}
                          placeholder="Search..."
                          value={jobSearchQuery}
                          onChange={(e) => setJobSearchQuery(e.target.value)}
                        />
                      </div>

                      <div className="hrd-form-group" style={{ gap: "4px" }}>
                        <label className="hrd-label" style={{ fontSize: "11px", color: "#64748b" }}>Domain</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%", padding: "6px 8px", fontSize: "12px" }}
                          value={jobDomainFilter}
                          onChange={(e) => setJobDomainFilter(e.target.value)}
                        >
                          <option value="">All Domains</option>
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="Data Science & Analytics">Data Science & Analytics</option>
                          <option value="Product Management">Product Management</option>
                          <option value="Design & Creative">Design & Creative</option>
                          <option value="Marketing & Sales">Marketing & Sales</option>
                          <option value="Finance & Accounting">Finance & Accounting</option>
                          <option value="Human Resources">Human Resources</option>
                          <option value="Customer Support">Customer Support</option>
                          <option value="Operations">Operations</option>
                        </select>
                      </div>

                      <div className="hrd-form-group" style={{ gap: "4px" }}>
                        <label className="hrd-label" style={{ fontSize: "11px", color: "#64748b" }}>Experience Level</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%", padding: "6px 8px", fontSize: "12px" }}
                          value={jobExpFilter}
                          onChange={(e) => setJobExpFilter(e.target.value)}
                        >
                          <option value="">All Levels</option>
                          <option value="Entry Level">Entry Level</option>
                          <option value="Mid Level">Mid Level</option>
                          <option value="Senior Level">Senior Level</option>
                          <option value="Lead / Manager">Lead / Manager</option>
                          <option value="Director / Executive">Director / Executive</option>
                        </select>
                      </div>

                      <div className="hrd-form-group" style={{ gap: "4px" }}>
                        <label className="hrd-label" style={{ fontSize: "11px", color: "#64748b" }}>Job Type</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%", padding: "6px 8px", fontSize: "12px" }}
                          value={jobTypeFilter}
                          onChange={(e) => setJobTypeFilter(e.target.value)}
                        >
                          <option value="">All Types</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>

                      <div className="hrd-form-group" style={{ gap: "4px" }}>
                        <label className="hrd-label" style={{ fontSize: "11px", color: "#64748b" }}>Sort By Date</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%", padding: "6px 8px", fontSize: "12px" }}
                          value={jobSortOrder}
                          onChange={(e) => setJobSortOrder(e.target.value)}
                        >
                          <option value="desc">Latest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>

                      <div style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "220px", overflowY: "auto", paddingRight: "4px" }}>
                        {filteredJobs.length === 0 ? (
                          <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", margin: "10px 0" }}>No matching jobs</p>
                        ) : (
                          filteredJobs.map((job) => {
                            const isSelected = selectedJobId === job.id;
                            return (
                              <div
                                key={job.id}
                                onClick={() => {
                                  setSelectedJobId(job.id);
                                  fetchJobApplications(job.id);
                                }}
                                style={{
                                  padding: "8px 10px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "12.5px",
                                  fontWeight: isSelected ? "600" : "500",
                                  background: isSelected ? "#eff6ff" : "transparent",
                                  color: isSelected ? "#2563eb" : "#475569",
                                  border: isSelected ? "1px solid #bfdbfe" : "1px solid transparent",
                                  transition: "all 0.2s"
                                }}
                              >
                                {job.title}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </aside>

                    {/* Right Main Panel: Expandable Job Cards */}
                    <div className="hrd-job-main-list">
                      {filteredJobs.length === 0 ? (
                        <div className="hrd-card" style={{ padding: "40px 20px", textAlign: "center" }}>
                          <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No job postings match your filters.</p>
                        </div>
                      ) : (
                        filteredJobs.map((job) => {
                          const isExpanded = expandedJobIds.includes(job.id);
                          const isSelected = selectedJobId === job.id;
                          const isOpen = !job.last_date || new Date(job.last_date) >= new Date();

                          return (
                            <div
                              key={job.id}
                              className="hrd-job-card"
                              style={{
                                borderColor: isSelected ? "#2563eb" : "#e2e8f0",
                                boxShadow: isSelected ? "0 4px 6px -1px rgba(37, 99, 235, 0.05)" : "0 1px 3px 0 rgba(0, 0, 0, 0.02)"
                              }}
                            >
                              <div className="hrd-job-card-header">
                                <div
                                  className="hrd-job-card-title-group"
                                  onClick={() => {
                                    setSelectedJobId(job.id);
                                    fetchJobApplications(job.id);
                                    if (isExpanded) {
                                      setExpandedJobIds(expandedJobIds.filter(id => id !== job.id));
                                    } else {
                                      setExpandedJobIds([...expandedJobIds, job.id]);
                                    }
                                  }}
                                >
                                  <span className={`hrd-job-card-arrow ${isExpanded ? "expanded" : ""}`}>▶</span>
                                  <div>
                                    <h4 className="hrd-job-card-title">{job.title}</h4>
                                    <div className="hrd-job-card-meta">
                                      <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                                      {job.domain && <span>• {job.domain}</span>}
                                      {job.location && <span>• {job.location}</span>}
                                    </div>
                                  </div>
                                </div>

                                <div className="hrd-job-card-header-badge-group">
                                  <span
                                    className="hrd-status-pill"
                                    style={
                                      isOpen
                                        ? { background: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" }
                                        : { background: "#fef2f2", color: "#991b1b", borderColor: "#fca5a5" }
                                    }
                                  >
                                    {isOpen ? "Active" : "Closed"}
                                  </span>
                                  <button 
                                    className="hrd-btn" 
                                    style={{ fontSize: "12px", padding: "6px 14px" }}
                                    onClick={() => {
                                      setSelectedJobId(job.id);
                                      fetchJobApplications(job.id);
                                      setViewingJobCandidates(true);
                                    }}
                                  >
                                    Action
                                  </button>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="hrd-job-card-details">
                                  <div className="hrd-job-details-grid">
                                    {job.domain && (
                                      <div className="hrd-job-details-item">
                                        <span className="hrd-job-details-label">Domain</span>
                                        <span className="hrd-job-details-value">{job.domain}</span>
                                      </div>
                                    )}
                                    {job.job_type && (
                                      <div className="hrd-job-details-item">
                                        <span className="hrd-job-details-label">Job Type</span>
                                        <span className="hrd-job-details-value">{job.job_type}</span>
                                      </div>
                                    )}
                                    {job.experience_level && (
                                      <div className="hrd-job-details-item">
                                        <span className="hrd-job-details-label">Experience Level</span>
                                        <span className="hrd-job-details-value">{job.experience_level}</span>
                                      </div>
                                    )}
                                    {job.location && (
                                      <div className="hrd-job-details-item">
                                        <span className="hrd-job-details-label">Location</span>
                                        <span className="hrd-job-details-value">{job.location}</span>
                                      </div>
                                    )}
                                    {job.education && (
                                      <div className="hrd-job-details-item">
                                        <span className="hrd-job-details-label">Education Required</span>
                                        <span className="hrd-job-details-value">{job.education}</span>
                                      </div>
                                    )}
                                    {job.last_date && (
                                      <div className="hrd-job-details-item">
                                        <span className="hrd-job-details-label">Application Deadline</span>
                                        <span
                                          className="hrd-job-details-value"
                                          style={{ color: !isOpen ? "#ef4444" : "#2563eb", fontWeight: "600" }}
                                        >
                                          {new Date(job.last_date).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {job.skills && job.skills.length > 0 && (
                                    <div className="hrd-job-desc-section">
                                      <span className="hrd-job-desc-title">Required Skills</span>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "2px" }}>
                                        {(typeof job.skills === "string" ? job.skills.split(",") : job.skills).map(s => (
                                          <span
                                            key={s}
                                            style={{ fontSize: "11.5px", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: "4px", color: "#475569" }}
                                          >
                                            {s.trim()}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {job.description && (
                                    <div className="hrd-job-desc-section">
                                      <span className="hrd-job-desc-title">Job Description</span>
                                      <p className="hrd-job-desc-text">{job.description}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="hrd-candidate-layout">
                    {/* Left Area: Candidate list table & active job info */}
                    <div className="hrd-candidate-main">
                      {(() => {
                        const activeJob = jobs.find(j => j.id === selectedJobId);
                        return (
                          <div className="hrd-candidate-active-job-info">
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <button
                                className="hrd-back-to-jobs-btn"
                                onClick={() => setViewingJobCandidates(false)}
                              >
                                ← Back to Job Listings
                              </button>
                              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "6px 0 0 0" }}>
                                Active Job: {activeJob ? activeJob.title : "Loading..."}
                              </h2>
                            </div>
                            {selectedJobId && (
                              <button
                                className="hrd-btn-danger"
                                style={{ padding: "8px 16px", fontSize: "13px" }}
                                onClick={() => {
                                  handleDeleteJob(selectedJobId);
                                  setViewingJobCandidates(false);
                                }}
                              >
                                Delete Job Posting
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      {/* Candidate table */}
                      <div className="hrd-card" style={{ padding: "20px" }}>
                        {loading ? (
                          <div style={{ display: "flex", justifyContent: "center", padding: "30px 0" }}>
                            <div className="hrd-spinner" />
                          </div>
                        ) : applications.length === 0 ? (
                          <p style={{ textAlign: "center", color: "#64748b", padding: 20, margin: 0, fontSize: "14px" }}>No candidates have applied for this job yet.</p>
                        ) : filteredApplications.length === 0 ? (
                          <p style={{ textAlign: "center", color: "#64748b", padding: 20, margin: 0, fontSize: "14px" }}>No candidates match the specified filters.</p>
                        ) : (
                          <table className="hrd-table">
                            <thead>
                              <tr>
                                <th>Candidate Profile</th>
                                <th>Contact & Education</th>
                                <th>Extracted Skills</th>
                                <th>Status</th>
                                <th>Reason</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredApplications.map((app) => (
                                <tr key={app.id}>
                                  <td>
                                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{app.name}</div>
                                    <div style={{ fontSize: 12.5, color: "#64748b" }}>{app.email}</div>
                                    {app.resume_url && (
                                      <a href={app.resume_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#2563eb", textDecoration: "underline", display: "inline-block", marginTop: 4 }}>
                                        View Resume PDF
                                      </a>
                                    )}
                                  </td>
                                  <td>
                                    <div style={{ fontSize: 13.5, fontWeight: "600" }}>{app.education}</div>
                                    <div style={{ fontSize: 12.5, color: "#475569" }}>CGPA: {app.cgpa}</div>
                                    <div style={{ fontSize: 12.5, color: "#475569" }}>Phone: {app.contact}</div>
                                  </td>
                                  <td>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                      {app.skills && app.skills.length > 0 ? (
                                        app.skills.slice(0, 5).map((s) => (
                                          <span key={s} style={{ fontSize: 11, background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "2px 8px", borderRadius: "4px", color: "#334155" }}>
                                            {s}
                                          </span>
                                        ))
                                      ) : (
                                        <span style={{ fontSize: 12.5, color: "#94a3b8", fontStyle: "italic" }}>No skills parsed</span>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <span className="hrd-status-pill" style={getStatusStyle(app.status)}>
                                      {getStatusLabel(app.status)}
                                    </span>
                                  </td>
                                  <td>
                                    {app.status === "interview_scheduled" && app.interview_start ? (
                                      <div style={{ fontSize: "11.5px", color: "#c2410c", display: "flex", flexDirection: "column", gap: "2px" }}>
                                        <div><strong>Start:</strong> {new Date(app.interview_start).toLocaleString()}</div>
                                        <div><strong>End:</strong> {new Date(app.interview_end).toLocaleString()}</div>
                                      </div>
                                    ) : app.reason ? (
                                      <span style={{ fontWeight: 500, color: app.reason.includes("cleared") && !app.reason.includes("not") ? "#166534" : "#475569" }}>
                                        {app.reason}
                                      </span>
                                    ) : (
                                      <span style={{ color: "#94a3b8", fontWeight: 500 }}>—</span>
                                    )}
                                  </td>
                                  <td>
                                    <div style={{ display: "flex", gap: 6 }}>
                                      {app.evaluation ? (
                                        <button className="hrd-btn hrd-btn-dark" onClick={() => setSelectedApp(app)}>
                                          View Scorecard
                                        </button>
                                      ) : app.status === "shortlisted" ? (
                                        <button className="hrd-btn" onClick={() => setSchedulingEmails([app.email])}>
                                          Schedule AI Interview
                                        </button>
                                      ) : app.status === "applied" ? (
                                        <span style={{ fontSize: 12.5, color: "#64748b", fontStyle: "italic" }}>Under review</span>
                                      ) : app.status === "interview_scheduled" ? (
                                        <>
                                          <button className="hrd-btn" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setSchedulingEmails([app.email])}>
                                            Reschedule
                                          </button>
                                          <button className="hrd-btn-danger" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleCancelInterview(app)}>
                                            Cancel
                                          </button>
                                        </>
                                      ) : app.status === "rejected" ? (
                                        <span style={{ fontSize: 12.5, color: "#ef4444", fontStyle: "italic" }}>Rejected</span>
                                      ) : null}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    {/* Right Sidebar: Filter & Sort Candidates */}
                    <aside className="hrd-candidate-sidebar">
                      <h3 className="hrd-label" style={{ fontSize: "14px", margin: 0, borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                        Filter Candidates
                      </h3>

                      <div className="hrd-form-group" style={{ gap: "4px" }}>
                        <label className="hrd-label" style={{ fontSize: "11px", color: "#64748b" }}>Search Candidates</label>
                        <input
                          type="text"
                          className="hrd-input"
                          style={{ maxWidth: "100%", padding: "6px 10px", fontSize: "12.5px" }}
                          placeholder="Name, email, skills..."
                          value={candidateSearchQuery}
                          onChange={(e) => setCandidateSearchQuery(e.target.value)}
                        />
                      </div>

                      <div className="hrd-form-group" style={{ gap: "4px" }}>
                        <label className="hrd-label" style={{ fontSize: "11px", color: "#64748b" }}>Filter by Status</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%", padding: "6px 8px", fontSize: "12.5px" }}
                          value={candidateStatusFilter}
                          onChange={(e) => setCandidateStatusFilter(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview_scheduled">Interview Scheduled</option>
                          <option value="interview_cleared">Interview Cleared</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="hrd-form-group" style={{ gap: "4px" }}>
                        <label className="hrd-label" style={{ fontSize: "11px", color: "#64748b" }}>Sort Candidates</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%", padding: "6px 8px", fontSize: "12.5px" }}
                          value={candidateSortKey}
                          onChange={(e) => setCandidateSortKey(e.target.value)}
                        >
                          <option value="">Default Order</option>
                          <option value="cgpa-desc">CGPA: High to Low</option>
                          <option value="cgpa-asc">CGPA: Low to High</option>
                          <option value="status-asc">Status: A to Z</option>
                          <option value="status-desc">Status: Z to A</option>
                          <option value="name-asc">Name: A to Z</option>
                        </select>
                      </div>

                      {/* Bulk Operations inside sidebar */}
                      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3 className="hrd-label" style={{ fontSize: "14px", margin: "0 0 4px 0" }}>
                          Bulk Operations
                        </h3>
                        <button
                          className="hrd-btn"
                          style={{ width: "100%", padding: "10px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          disabled={!applications.some(app => app.status === "shortlisted")}
                          onClick={() => setSchedulingEmails([])}
                        >
                          Schedule in Bulk
                        </button>
                        <button
                          className="hrd-btn hrd-btn-secondary"
                          style={{ width: "100%", padding: "10px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          disabled={!applications.some(app => app.status === "interview_scheduled")}
                          onClick={() => {
                            const scheduledEmails = applications.filter(app => app.status === "interview_scheduled").map(app => app.email);
                            setSchedulingEmails(scheduledEmails);
                          }}
                        >
                          Reschedule All
                        </button>
                        <button
                          className="hrd-btn-danger"
                          style={{ width: "100%", padding: "10px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          disabled={!applications.some(app => app.status === "interview_scheduled")}
                          onClick={handleCancelAllInterviews}
                        >
                          Cancel All
                        </button>
                      </div>
                    </aside>
                  </div>
                )
              )}

              {/* TAB 2: POST A JOB */}
              {activeTab === "post-job" && (
                <div className="hrd-card">
                  <h2 className="hrd-label" style={{ fontSize: 15, textTransform: "uppercase", marginBottom: 16 }}>Create New Job Posting</h2>
                  <form onSubmit={handlePostJob} className="hrd-form">
                    <div className="hrd-form-group">
                      <label className="hrd-label">Job Title</label>
                      <input
                        type="text"
                        className="hrd-input"
                        style={{ maxWidth: "100%" }}
                        placeholder="e.g. Mathematics Tutor"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="hrd-form-group">
                      <label className="hrd-label">Job Description & Requirements</label>
                      <textarea
                        className="hrd-textarea"
                        placeholder="Describe role responsibilities, required qualifications, key topics, and expectations."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                      <div className="hrd-form-group">
                        <label className="hrd-label">Education Qualification Required</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%" }}
                          value={newEducation}
                          onChange={(e) => setNewEducation(e.target.value)}
                        >
                          <option value="High School">High School</option>
                          <option value="Associate's Degree">Associate's Degree</option>
                          <option value="Bachelor's Degree">Bachelor's Degree</option>
                          <option value="Master's Degree">Master's Degree</option>
                          <option value="Ph.D.">Ph.D.</option>
                          <option value="Not Specified">Not Specified</option>
                        </select>
                      </div>

                      <div className="hrd-form-group">
                        <label className="hrd-label">Location</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%" }}
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                        >
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="On-site">On-site</option>
                          <option value="New York">New York</option>
                          <option value="San Francisco">San Francisco</option>
                          <option value="London">London</option>
                          <option value="Bangalore">Bangalore</option>
                          <option value="Singapore">Singapore</option>
                        </select>
                      </div>

                      <div className="hrd-form-group">
                        <label className="hrd-label">Type of Job</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%" }}
                          value={newJobType}
                          onChange={(e) => setNewJobType(e.target.value)}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>

                      <div className="hrd-form-group">
                        <label className="hrd-label">Experience Level</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%" }}
                          value={newExpLevel}
                          onChange={(e) => setNewExpLevel(e.target.value)}
                        >
                          <option value="Entry Level">Entry Level</option>
                          <option value="Mid Level">Mid Level</option>
                          <option value="Senior Level">Senior Level</option>
                          <option value="Lead / Manager">Lead / Manager</option>
                          <option value="Director / Executive">Director / Executive</option>
                        </select>
                      </div>

                      <div className="hrd-form-group">
                        <label className="hrd-label">Domain of Job</label>
                        <select
                          className="hrd-select"
                          style={{ maxWidth: "100%" }}
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                        >
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="Data Science & Analytics">Data Science & Analytics</option>
                          <option value="Product Management">Product Management</option>
                          <option value="Design & Creative">Design & Creative</option>
                          <option value="Marketing & Sales">Marketing & Sales</option>
                          <option value="Finance & Accounting">Finance & Accounting</option>
                          <option value="Human Resources">Human Resources</option>
                          <option value="Customer Support">Customer Support</option>
                          <option value="Operations">Operations</option>
                        </select>
                      </div>

                      <div className="hrd-form-group">
                        <label className="hrd-label">Last Date to Apply</label>
                        <input
                          type="date"
                          className="hrd-input"
                          style={{ maxWidth: "100%" }}
                          value={newLastDate}
                          onChange={(e) => setNewLastDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="hrd-form-group">
                      <label className="hrd-label">Required Skills (Manually Filled)</label>
                      <input
                        type="text"
                        className="hrd-input"
                        style={{ maxWidth: "100%" }}
                        placeholder="e.g. React, Node.js, Python (comma separated)"
                        value={newSkills}
                        onChange={(e) => setNewSkills(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="hrd-btn" style={{ alignSelf: "flex-start", padding: "10px 20px" }} disabled={submittingJob}>
                      {submittingJob ? "Posting..." : "Post Job Announcement"}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: AI SCREENING TOOL */}
              {activeTab === "shortlist" && (
                <div className="hrd-card">
                  <h2 className="hrd-label" style={{ fontSize: 15, textTransform: "uppercase", marginBottom: 12 }}>AI-Powered Candidate Shortlisting</h2>
                  <p style={{ fontSize: 13.5, color: "#64748b", marginTop: -6, marginBottom: 20 }}>
                    Select an active job. Our AI models will match the job description details against all profiles in the <strong>"Applied"</strong> status for that job and pick the best candidates.
                  </p>

                  <form onSubmit={handleRunAIShortlist} className="hrd-form">
                    <div className="hrd-form-group">
                      <label className="hrd-label">Select Target Job Posting</label>
                      <select
                        className="hrd-select"
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        required
                      >
                        {jobs.map((job) => (
                          <option key={job.id} value={job.id}>{job.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="hrd-form-group">
                      <label className="hrd-label">Number of Candidates to Shortlist</label>
                      <input
                        type="number"
                        min="1"
                        className="hrd-input"
                        value={shortlistCount}
                        onChange={(e) => setShortlistCount(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="hrd-btn" style={{ alignSelf: "flex-start", padding: "10px 20px" }}>
                      Run AI Screening
                    </button>
                  </form>

                  {recommendations.length > 0 && (
                    <div style={{ marginTop: 28, borderTop: "1px solid #e2e8f0", paddingTop: 20 }}>
                      <h3 className="hrd-label" style={{ color: "#10b981", fontSize: 14 }}>AI Recommendations ({recommendations.length})</h3>

                      <div style={{ margin: "14px 0", background: "#f0fdf4", border: "1px solid #10b981", padding: 16, borderRadius: "6px" }}>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, color: "#1e293b", display: "flex", flexDirection: "column", gap: 10 }}>
                          {recommendations.map(r => (
                            <li key={r.email}>
                              <strong>{r.name}</strong> ({r.email})
                              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                Education: {r.education} | CGPA: {r.cgpa}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button className="hrd-btn hrd-btn-success" style={{ padding: "10px 20px" }} onClick={handleConfirmShortlist}>
                        Confirm and Shortlist Selected Applicants
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* OTHER NON-FUNCTIONAL TABS */}
          {activeNav !== "dashboard" && activeNav !== "recruitment" && (
            <div className="hrd-placeholder-container">
              <div className="hrd-placeholder-card">
                <h3>{navItems.find(item => item.id === activeNav)?.label} Module</h3>
                <p>This module is currently under development / non-functional.</p>
                <span className="hrd-coming-soon-badge">Coming Soon</span>
              </div>
            </div>
          )}
        </main>

        {/* SCORECARD MODAL */}
        {selectedApp && (
          <div className="hrd-modal-backdrop" onClick={() => setSelectedApp(null)}>
            <div className="hrd-modal" onClick={(e) => e.stopPropagation()}>
              <button className="hrd-modal-close" onClick={() => setSelectedApp(null)}>✕</button>

              <h2 className="hrd-label" style={{ fontSize: 15, borderBottom: "1px solid #e2e8f0", paddingBottom: 10, margin: 0 }}>
                Evaluation Scorecard: {selectedApp.name}
              </h2>

              <div style={{ fontSize: 13, color: "#64748b", display: "flex", flexDirection: "column", gap: 4 }}>
                <div>Email: {selectedApp.email}</div>
                <div>Status: {selectedApp.status.replace("_", " ")}</div>
              </div>

              {/* Render Metrics */}
              {(() => {
                const parsed = parseResult(selectedApp.evaluation?.result);
                const isShortlisted = parsed.verdict?.includes("SHORTLIST");
                return (
                  <>
                    <h3 className="hrd-label" style={{ textTransform: "uppercase", fontSize: 11, color: "#94a3b8", margin: 0 }}>Skills Breakdown</h3>
                    <div className="hrd-score-grid">
                      {parsed.metrics.map((m, idx) => (
                        <div key={idx} className="hrd-score-box">
                          <div className="hrd-score-label">{m.label}</div>
                          <div className="hrd-score-value">{m.score}/{m.total}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {parsed.strengths.length > 0 && (
                        <div>
                          <h4 className="hrd-label" style={{ color: "#16a34a", fontSize: 13.5, margin: "0 0 4px 0" }}>Strengths</h4>
                          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                            {parsed.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                          </ul>
                        </div>
                      )}

                      {parsed.weaknesses.length > 0 && (
                        <div>
                          <h4 className="hrd-label" style={{ color: "#dc2626", fontSize: 13.5, margin: "0 0 4px 0" }}>Weaknesses</h4>
                          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                            {parsed.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
                          </ul>
                        </div>
                      )}

                      {parsed.verdict && (
                        <div style={{ marginTop: 8, padding: 12, background: isShortlisted ? "#f0fdf4" : "#fef2f2", border: `1px solid ${isShortlisted ? "#bbf7d0" : "#fca5a5"}`, borderRadius: "6px" }}>
                          <strong style={{ fontSize: 13, textTransform: "uppercase", color: "#334155" }}>Verdict: </strong>
                          <span style={{ fontWeight: "700", color: isShortlisted ? "#16a34a" : "#dc2626" }}>
                            {parsed.verdict}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              <button
                className="hrd-btn hrd-btn-dark"
                style={{ padding: "10px 16px", marginTop: 8, alignSelf: "flex-start" }}
                onClick={() => setViewChatId(selectedApp.evaluation?.chat_id)}
              >
                Open Interview Chat History
              </button>
            </div>
          </div>
        )}

        {/* SCHEDULE INTERVIEW MODAL */}
        {schedulingEmails !== null && (
          <div className="hrd-modal-backdrop" onClick={() => setSchedulingEmails(null)}>
            <div className="hrd-modal" onClick={(e) => e.stopPropagation()}>
              <button className="hrd-modal-close" onClick={() => setSchedulingEmails(null)}>✕</button>

              <h2 className="hrd-label" style={{ fontSize: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", margin: 0 }}>
                {schedulingEmails.length === 0
                  ? "Schedule Interviews in Bulk"
                  : schedulingEmails.length > 1
                    ? "Reschedule All Interviews"
                    : "Schedule Candidate Interview"}
              </h2>

              <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                {schedulingEmails.length === 0
                  ? "Specify the start and end dates/times for all shortlisted candidates. They will only be allowed to start the AI interview during this window."
                  : schedulingEmails.length > 1
                    ? `Specify the start and end dates/times for all ${schedulingEmails.length} scheduled candidates.`
                    : `Specify the start and end dates/times for candidate: ${schedulingEmails[0]}`}
              </p>

              <div className="hrd-form" style={{ gap: "16px", marginTop: "8px" }}>
                <div className="hrd-form-group">
                  <label className="hrd-label">Interview Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="hrd-input"
                    style={{ maxWidth: "100%" }}
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div className="hrd-form-group">
                  <label className="hrd-label">Interview End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="hrd-input"
                    style={{ maxWidth: "100%" }}
                    value={scheduleEnd}
                    onChange={(e) => setScheduleEnd(e.target.value)}
                    min={scheduleStart || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                  <button
                    type="button"
                    className="hrd-btn"
                    style={{ background: "#cbd5e1", borderColor: "#cbd5e1", color: "#475569" }}
                    onClick={() => setSchedulingEmails(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="hrd-btn"
                    disabled={!scheduleStart || !scheduleEnd}
                    onClick={submitSchedule}
                  >
                    Confirm & Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HRDashboard;
